import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth'

import app from './app'

const auth = getAuth(app)

export const signup = async (email, password)=>{
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

export const signin = async (email, password)=>{
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

export const logout = async ()=>{
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

export const onAuthStateChange = (callback)=>{ // for real-time authentication state changes
    onAuthStateChanged(auth, callback);
}
