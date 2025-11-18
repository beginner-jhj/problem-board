import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc} from 'firebase/firestore';
import { db } from "./app";
import { assert,appError } from "../utils/appError";


export const addInappNotification = async (data = {}) => {
    const { recipientId, type, problemId, actorId, actorName } = data;
    try {
        await addDoc(collection(db, "notifications"), {
            recipientId,
            type,
            problemId,
            actorId,
            actorName,
            createdAt:serverTimestamp() ,
            read: false,
        });
    } catch (error) {
        throw error;
    }
}

export const deleteInappNotification =  async (actorId,type,problemId)=>{
    try{
        const q = query(collection(db, "notifications"), where("actorId", "==", actorId), where("type", "==", type), where("problemId", "==", problemId));
        const querySnapshot = await getDocs(q);
        console.log(querySnapshot.docs);
        const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "notifications", docSnap.id)));
        await Promise.all(deletePromises);
        return true;
    }catch(error){
        throw error;
    }
}