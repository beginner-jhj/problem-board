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


export const addComment = async (comment) => {
    try {
        assert(comment && typeof comment === 'object', 'comment/invalid-args');
        const { content, userId, userName, problemId } = comment || {};
        assert(typeof content === 'string' && content.trim().length > 0, 'comment/empty');
        assert(userId && typeof userId === 'string', 'auth/unauthenticated');
        assert(userName && typeof userName === 'string', 'auth/invalid-user');
        assert(problemId && typeof problemId === 'string', 'comment/invalid-problem');
        const docRef = await addDoc(collection(db, "comments"), {
            ...comment,
            createdAt: serverTimestamp(),
            likes: 0,
            likedBy: [],
            dislikes: 0,
            dislikedBy: [],
            accepted: false,
        });
        return docRef;
    } catch (error) {
        throw error;
    }
}

export const toggleAccept = async (commentId) => {
    try {
        assert(commentId, 'comment/invalid-id');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const comment = docSnap.data();
            const nextAccepted = !Boolean(comment.accepted);
            await updateDoc(docRef, { accepted: nextAccepted });
            // Update parent problem status accordingly
            const problemRef = doc(db, "problems", comment.problemId);
            const problemSnap = await getDoc(problemRef);
            if (problemSnap.exists()) {
                const problem = problemSnap.data();
                const nextStatus = nextAccepted
                  ? "Resolved"
                  : (problem.watching || 0) > 3
                  ? "Trending"
                  : "Open";
                await updateDoc(problemRef, { status: nextStatus });
                return { accepted: nextAccepted, status: nextStatus };
            }
            return { accepted: nextAccepted };
        } else {
            throw appError('comment/not-found');
        }
    } catch (error) {
        throw error;
    }
}


export const updateComment = async (commentId, content) => {
    try {
        assert(commentId, 'comment/invalid-id');
        assert(typeof content === 'string' && content.trim().length > 0, 'comment/empty');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                content,
                updatedAt: serverTimestamp(),
            });
            return { id: commentId, content };
        } else {
            throw appError('comment/not-found');
        }
    } catch (error) {
        throw error;
    }
}

export const deleteComment = async (commentId) => {
    try {
        assert(commentId, 'comment/invalid-id');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await deleteDoc(docRef);
            return true;
        } else {
            throw appError('comment/not-found');
        }
    } catch (error) {
        throw error;
    }
}

export const deleteCommentsByUserId = async (userId) => {
    try {
        const q = query(collection(db, "comments"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "comments", docSnap.id)));
        await Promise.all(deletePromises);
        return true;
    } catch (error) {
        throw error;
    }
}

export const getAllComments = async (problemId) => {
    try {
        assert(problemId && typeof problemId === 'string', 'comment/invalid-problem');
        const q = query(collection(db, "comments"), where("problemId", "==", problemId));
        const querySnapshot = await getDocs(q);
        const comments = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));
        return comments;
    } catch (error) {
        throw error;
    }
}

export const toggleLike = async (commentId, userId) => {
    try {
        assert(commentId, 'comment/invalid-id');
        assert(userId, 'auth/unauthenticated');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const comment = docSnap.data();
            const already = Array.isArray(comment.likedBy) && comment.likedBy.includes(userId);
            if (already) {
                const nextArr = comment.likedBy.filter((id) => id !== userId);
                const nextCount = Math.max(0, (comment.likes || 0) - 1);
                await updateDoc(docRef, {
                    likes: nextCount,
                    likedBy: nextArr,
                });
                return { likes: nextCount, likedBy: nextArr, liked: false };
            } else {
                const nextArr = [...(comment.likedBy || []), userId];
                const nextCount = (comment.likes || 0) + 1;
                await updateDoc(docRef, {
                    likes: nextCount,
                    likedBy: nextArr,
                });
                return { likes: nextCount, likedBy: nextArr, liked: true };
            }
        } else {
            throw appError('comment/not-found');
        }
    } catch (error) {
        throw error;
    }
}

export const toggleDislike = async (commentId, userId) => {
    try {
        assert(commentId, 'comment/invalid-id');
        assert(userId, 'auth/unauthenticated');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const comment = docSnap.data();
            const already = Array.isArray(comment.dislikedBy) && comment.dislikedBy.includes(userId);
            if (already) {
                const nextArr = comment.dislikedBy.filter((id) => id !== userId);
                const nextCount = Math.max(0, (comment.dislikes || 0) - 1);
                await updateDoc(docRef, {
                    dislikes: nextCount,
                    dislikedBy: nextArr,
                });
                return { dislikes: nextCount, dislikedBy: nextArr, disliked: false };
            } else {
                const nextArr = [...(comment.dislikedBy || []), userId];
                const nextCount = (comment.dislikes || 0) + 1;
                await updateDoc(docRef, {
                    dislikes: nextCount,
                    dislikedBy: nextArr,
                });
                return { dislikes: nextCount, dislikedBy: nextArr, disliked: true };
            }
        } else {
            throw appError('comment/not-found');
        }
    } catch (error) {
        throw error;
    }
}