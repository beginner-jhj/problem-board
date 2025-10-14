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
        assert(comment && typeof comment === 'object', 'comment/invalid-args', 'Comment payload is required');
        const { content, userId, userName, problemId } = comment || {};
        assert(typeof content === 'string' && content.trim().length > 0, 'comment/empty', 'Comment content is required');
        assert(userId && typeof userId === 'string', 'auth/unauthenticated', 'User must be authenticated');
        assert(userName && typeof userName === 'string', 'auth/invalid-user', 'User name is required');
        assert(problemId && typeof problemId === 'string', 'comment/invalid-problem', 'Problem ID is required');
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
        console.error("Error writing document:", error);
        throw error;
    }
}

export const toggleAccept = async (commentId) => {
    try {
        assert(commentId, 'comment/invalid-id', 'Comment ID is required');
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
            throw appError('db/not-found', 'Comment not found');
        }
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
}


export const updateComment = async (commentId, content) => {
    try {
        assert(commentId, 'comment/invalid-id', 'Comment ID is required');
        assert(typeof content === 'string' && content.trim().length > 0, 'comment/empty', 'Comment content is required');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await updateDoc(docRef, {
                content,
                updatedAt: serverTimestamp(),
            });
            return { id: commentId, content };
        } else {
            throw appError('db/not-found', 'Comment not found');
        }
    } catch (error) {
        console.error("Error updating document:", error);
        throw error;
    }
}

export const deleteComment = async (commentId) => {
    try {
        assert(commentId, 'comment/invalid-id', 'Comment ID is required');
        const docRef = doc(db, "comments", commentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            await deleteDoc(docRef);
            return true;
        } else {
            throw appError('db/not-found', 'Comment not found');
        }
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}


export const getAllComments = async (problemId) => {
    try {
        assert(problemId && typeof problemId === 'string', 'comment/invalid-problem', 'Problem ID is required');
        const q = query(collection(db, "comments"), where("problemId", "==", problemId));
        const querySnapshot = await getDocs(q);
        const comments = querySnapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
        }));
        return comments;
    } catch (error) {
        console.error("Error reading document:", error);
        throw error;
    }
}

export const toggleLike = async (commentId, userId) => {
    try {
        assert(commentId, 'comment/invalid-id', 'Comment ID is required');
        assert(userId, 'auth/unauthenticated', 'User must be authenticated');
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
            throw appError('db/not-found', 'Comment not found');
        }
    } catch (error) {
        console.error("Error reading document:", error);
        throw error;
    }
}

export const toggleDislike = async (commentId, userId) => {
    try {
        assert(commentId, 'comment/invalid-id', 'Comment ID is required');
        assert(userId, 'auth/unauthenticated', 'User must be authenticated');
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
            throw appError('db/not-found', 'Comment not found');
        }
    } catch (error) {
        console.error("Error reading document:", error);
        throw error;
    }
}