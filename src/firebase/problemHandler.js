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

export const addProblem = async (problem, userId) => {
  try {
    const docRef = await addDoc(collection(db, "problems"), {
      ...problem,
      createdAt: serverTimestamp(),
      empathy: 0,
      views: 0,
      watching: 0,
      userId: userId,
      empathizedBy: [],
      viewsBy: [],
      watchingBy: [],
      status: "Open",
    });
    return docRef;
  } catch (error) {
    console.error("Error writing document:", error);
    throw error;
  }
};

export const toggleWatching = async (problemId, userId) => {
  try {
    const docRef = doc(db, "problems", problemId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    const already = Array.isArray(data.watchingBy) && data.watchingBy.includes(userId);
    if (already) {
      const nextArr = data.watchingBy.filter((id) => id !== userId);
      const nextCount = Math.max(0, (data.watching || 0) - 1);
      const nextStatus = data.status === "Resolved" ? "Resolved" : (nextCount > 3 ? "Trending" : "Open");
      await updateDoc(docRef, { watchingBy: nextArr, watching: nextCount, status: nextStatus });
      return { watching: nextCount, watchingBy: nextArr, watched: false, status: nextStatus };
    } else {
      const nextArr = [...(data.watchingBy || []), userId];
      const nextCount = (data.watching || 0) + 1;
      const nextStatus = data.status === "Resolved" ? "Resolved" : (nextCount > 3 ? "Trending" : "Open");
      await updateDoc(docRef, { watchingBy: nextArr, watching: nextCount, status: nextStatus });
      return { watching: nextCount, watchingBy: nextArr, watched: true, status: nextStatus };
    }
  } catch (error) {
    console.error("Error toggling watching:", error);
    throw error;
  }
};

export const toggleEmpathy = async (problemId, userId) => {
  try {
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
        return { empathy: nextCount, empathizedBy: nextArr, empathized: false };
      } else {
        const nextArr = [...(problem.empathizedBy || []), userId];
        const nextCount = (problem.empathy || 0) + 1;
        await updateDoc(docRef, {
          empathy: nextCount,
          empathizedBy: nextArr,
        });
        return { empathy: nextCount, empathizedBy: nextArr, empathized: true };
      }
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error);
    throw error;
  }
};

export const increaseView = async (problemId, userId) => {
  try {
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const problem = docSnap.data();
      if (problem.viewsBy.includes(userId)) {
        return null;
      }
      const newViews = problem.views + 1;
      await updateDoc(docRef, {
        views: newViews,
        viewsBy: [...problem.viewsBy, userId],
      });
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error);
    throw error;
  }
};

export const updateProblem = async (problemId, problem) => {
  try {
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { title, description, category, frequency, features } =
        problem || {};
      await updateDoc(docRef, {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(frequency !== undefined ? { frequency } : {}),
        ...(features !== undefined ? { features } : {}),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error);
    throw error;
  }
};

export const deleteProblem = async (problemId) => {
  try {
    const docRef = doc(db, "problems", problemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error);
    throw error;
  }
};

export const getDocById = async (id) => {
  try {
    const docRef = doc(db, "problems", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error);
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
    console.error("Error reading documents:", error);
    throw error;
  }
};

export const getDocsByCategory = async (category) => {
  try {
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
    console.error("Error reading documents:", error);
    throw error;
  }
};

export const getDocsByUserId = async (userId) => {
  try {
    const q = query(collection(db, "problems"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const problems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return problems;
  } catch (error) {
    console.error("Error reading documents:", error);
    throw error;
  }
};
