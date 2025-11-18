import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, updateDoc} from 'firebase/firestore';
import { db } from "./app";

export const addInappNotification = async (data = {}) => {
    const { recipientId, type, problemId, problemTitle, actorId, actorName } = data;
    try {
        // derive a user-facing message when not provided
        let message = data.message || '';
        if (!message) {
            if (type === 'watch') {
                message = `${actorName} watched your problem.`;
            } else if (type === 'empathy') {
                message = `${actorName} empathized with your problem`;
            } else if (type === 'accept') {
                message = `Your solution is accepted!`;
            } else if (type === 'comment') {
                message = `${actorName} commented on your problem.`;
            } else {
                message = '';
            }
        }

        await addDoc(collection(db, "notifications"), {
            recipientId,
            type,
            problemId,
            problemTitle,
            actorId,
            actorName,
            message,
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
        const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "notifications", docSnap.id)));
        await Promise.all(deletePromises);
        return true;
    }catch(error){
        throw error;
    }
}

export const getUnreadNotificationsCount = async (userId)=>{
    try{
        const q = query(collection(db, "notifications"), where("recipientId", "==", userId), where("read", "==", false));
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    }catch(error){
        throw error;
    }
}


export const getUnreadNotificationContents = async (userId)=>{
    try{
        const q = query(collection(db, "notifications"), where("recipientId", "==", userId), where("read", "==", false));
        const querySnapshot = await getDocs(q);
        const notifications = [];
        querySnapshot.forEach((doc) => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        return notifications;
    }catch(error){
        throw error;
    }
}

export const markNotificationsAsRead = async (notificationId)=>{
    try{
        const docRef = doc(db, "notifications", notificationId);
        await updateDoc(docRef, {
            read: true,
        });
        return true;
    }catch(error){
        throw error;
    }
}