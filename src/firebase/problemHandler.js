import { 
    collection, 
    addDoc, 
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp 
  } from "firebase/firestore";
import { db } from "./app";

export const addProblem  = async (problem, userId)=>{
    try {
        const docRef = await addDoc(collection(db, "problems"),{
            ...problem,
            createdAt: serverTimestamp(),
            empathy: 0,
            views: 0,
            userId: userId,
            empathizedBy: [],
            viewsBy: []
        })
        console.log("Document successfully written!", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error writing document:", error);
        throw error;
    }
}

export const increaseEmpathy = async (problemId, userId)=>{
    try {
        const docRef = doc(db, "problems", problemId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const problem = docSnap.data();
            if(problem.empathizedBy.includes(userId)){
                return null;
            }
            const newEmpathy = problem.empathy + 1;
            await updateDoc(docRef, { empathy: newEmpathy, empathizedBy: [...problem.empathizedBy, userId] });
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error reading document:", error);
        throw error;
    }
}

export const increaseView = async (problemId, userId)=>{
    try {
        const docRef = doc(db, "problems", problemId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const problem = docSnap.data();
            if(problem.viewsBy.includes(userId)){
                return null;
            }
            const newViews = problem.views + 1;
            await updateDoc(docRef, { views: newViews, viewsBy: [...problem.viewsBy, userId] });
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error reading document:", error);
        throw error;
    }
}

export const getDocById = async (id)=>{
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
}

export const getAllDocs = async ()=>{
    try {
        const querySnapshot = await getDocs(collection(db, "problems"));
        const problems = querySnapshot.docs.map(doc => doc.data());
        return problems;
    } catch (error) {
        console.error("Error reading documents:", error);
        throw error;
    }
}

export const getDocsByCategory = async (category)=>{
    try {
        const query = query(collection(db, "problems"), where("category", "==", category));
        const querySnapshot = await getDocs(query);
        const problems = querySnapshot.docs.map(doc => doc.data());
        return problems;
    } catch (error) {
        console.error("Error reading documents:", error);
        throw error;
    }
}