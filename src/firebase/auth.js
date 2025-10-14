import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'

import app from './app'

const auth = getAuth(app)

export const signup = async (email, password, name)=>{
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const username = createRandomUsername(name);
        await updateProfile(userCredential.user, {displayName: username});
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

const createRandomUsername = (name)=>{
    const random = Date.now().toString().slice(-6);
    return `${name.replace(" ", "_")}_${random}`;
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
