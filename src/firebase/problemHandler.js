import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "./app";
import { assert, appError } from "../utils/appError";
import { addInappNotification, deleteInappNotification } from "./notificationHandler";

export const addProblem = async (problem, userId, userName) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/unauthenticated');
    assert(problem && typeof problem === 'object', 'problem/invalid-args');
    const { title, description, category, frequency } = problem || {};
    assert(title && description && category && frequency, 'problem/missing-fields');
    assert(userName && typeof userName === 'string', 'user/missing-name');
    const docRef = await addDoc(collection(db, "problems"), {
      ...problem,
      createdAt: serverTimestamp(),
      empathy: 0,
      views: 0,
      watching: 0,
      userId: userId,
      userName: userName,
      empathizedBy: [],
      viewsBy: [],
      watchingBy: [],
      status: "Open",
    });
    return docRef;
  } catch (error) {
    throw error;
  }
};

export const toggleWatching = async (problemId, userId, userName) => {
  try {
    assert(problemId, 'problem/invalid-id');
    assert(userId, 'auth/unauthenticated');
    const docRef = doc(db, "problems", problemId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw appError('problem/not-found');
    const data = snap.data();
    const already = Array.isArray(data.watchingBy) && data.watchingBy.includes(userId);
    if (already) {
      const nextArr = data.watchingBy.filter((id) => id !== userId);
      const nextCount = Math.max(0, (data.watching || 0) - 1);
      const nextStatus = data.status === "Resolved" ? "Resolved" : (nextCount > 3 ? "Trending" : "Open");
      await updateDoc(docRef, { watchingBy: nextArr, watching: nextCount, status: nextStatus });
      await deleteInappNotification(userId, 'watch', problemId);
      return { watching: nextCount, watchingBy: nextArr, watched: false, status: nextStatus };
    } else {
      const nextArr = [...(data.watchingBy || []), userId];
      const nextCount = (data.watching || 0) + 1;
      const nextStatus = data.status === "Resolved" ? "Resolved" : (nextCount > 3 ? "Trending" : "Open");
      await updateDoc(docRef, { watchingBy: nextArr, watching: nextCount, status: nextStatus });
      await addInappNotification({
        recipientId: data.userId,
        type: 'watch',
        problemId: problemId,
        actorId: userId,
        actorName: userName,
      });
      return { watching: nextCount, watchingBy: nextArr, watched: true, status: nextStatus };
    }
  } catch (error) {
    throw error;
  }
};

export const toggleEmpathy = async (problemId, userId, userName) => {
  try {
    assert(problemId, 'problem/invalid-id');
    assert(userId, 'auth/unauthenticated');
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const problem = docSnap.data();
      const already =
        Array.isArray(problem.empathizedBy) &&
        problem.empathizedBy.includes(userId);
      if (already) {
        const nextArr = problem.empathizedBy.filter((id) => id !== userId);
        const nextCount = Math.max(0, (problem.empathy || 0) - 1);
        await updateDoc(docRef, {
          empathy: nextCount,
          empathizedBy: nextArr,
        });
        await deleteInappNotification(userId, 'empathy', problemId);  
        return { empathy: nextCount, empathizedBy: nextArr, empathized: false };
      } else {
        const nextArr = [...(problem.empathizedBy || []), userId];
        const nextCount = (problem.empathy || 0) + 1;
        await updateDoc(docRef, {
          empathy: nextCount,
          empathizedBy: nextArr,
        });
        await addInappNotification({
          recipientId: problem.userId,
          type: 'empathy',
          problemId: problemId,
          actorId: userId,
          actorName: userName,
        });
        return { empathy: nextCount, empathizedBy: nextArr, empathized: true };
      }
    } else {
      throw appError('problem/not-found');
    }
  } catch (error) {
    throw error;
  }
};

export const increaseView = async (problemId, userId) => {
  try {
    assert(problemId, 'problem/invalid-id');
    assert(userId, 'auth/unauthenticated');
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const problem = docSnap.data();
      const viewsBy = Array.isArray(problem.viewsBy) ? problem.viewsBy : [];
      const views = typeof problem.views === 'number' ? problem.views : 0;
      if (viewsBy.includes(userId)) {
        return null;
      }
      const newViews = views + 1;
      await updateDoc(docRef, {
        views: newViews,
        viewsBy: [...viewsBy, userId],
      });
    } else {
      throw appError('problem/not-found');
    }
  } catch (error) {
    throw error;
  }
};

export const updateProblem = async (problemId, problem) => {
  try {
    assert(problemId, 'problem/invalid-id');
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { title, description, category, frequency, features } =
        problem || {};
      assert(
        title !== undefined || description !== undefined || category !== undefined || frequency !== undefined || features !== undefined,
        'problem/no-updates'
      );
      await updateDoc(docRef, {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(frequency !== undefined ? { frequency } : {}),
        ...(features !== undefined ? { features } : {}),
        updatedAt: serverTimestamp(),
      });
    } else {
      throw appError('problem/not-found');
    }
  } catch (error) {
    throw error;
  }
};

export const deleteProblem = async (problemId, userId) => {
  try {
    assert(problemId, 'problem/invalid-id');
    assert(userId && typeof userId === 'string', 'auth/unauthenticated');
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
      return true;
    } else {
      throw appError('problem/not-found');
    }
  } catch (error) {
    throw error;
  }
};

export const deleteProblemsByUserId = async (userId)=>{
  try{
    const q = query(collection(db, "problems"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "problems", docSnap.id)));
    await Promise.all(deletePromises);
    return true;
  }catch(error){
    throw error;
  }
}

export const getDocById = async (id) => {
  try {
    assert(id, 'problem/invalid-id');
    const docRef = doc(db, "problems", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw appError('problem/not-found');
    }
  } catch (error) {
    throw error;
  }
};

export const getAllDocs = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "problems"));
    const problems = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    return problems;
  } catch (error) {
    throw error;
  }
};

export const getDocsByCategory = async (category) => {
  try {
    assert(category && typeof category === 'string', 'problem/invalid-category', 'Category is required');
    const q = query(
      collection(db, "problems"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    const problems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return problems;
  } catch (error) {
    throw error;
  }
};

export const getDocsByUserId = async (userId) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user', 'User ID is required');
    const q = query(collection(db, "problems"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const problems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return problems;
  } catch (error) {
    throw error;
  }
};
