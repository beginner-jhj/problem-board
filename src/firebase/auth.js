import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'

import app from './app'
import { appError } from '../utils/appError'
import { createUserProfile, deleteUserProfile } from './userHandler'
import { deleteCommentsByUserId } from './commentHanler';
import { deleteProblemsByUserId } from './problemHandler';


const auth = getAuth(app)

export const signup = async (email, password, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const username = createRandomUsername(name);
        await updateProfile(userCredential.user, { displayName: username });

        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, {
            displayName: username,
            email: email
        });

        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

const createRandomUsername = (name) => {
    const random = Date.now().toString().slice(-6);
    return `${name.replace(" ", "_")}_${random}`;
}

export const signin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

const reauthenticate = async (user, password) => {

    if (!user) throw appError('auth/unauthenticated');

    const credential = EmailAuthProvider.credential(
        user.email,
        password
    );

    try {
        await reauthenticateWithCredential(user, credential);
        return true;
    } catch {
        throw appError('user/reauthentication-failed');
    }
}

export const deleteAccountWithReauth = async (password) => {
    const user = auth.currentUser;
    try {
        const reauthed = await reauthenticate(user, password);
        if (reauthed) {
            await deleteCommentsByUserId(user.uid);
            await deleteProblemsByUserId(user.uid);
            await deleteUserProfile(user.uid);
            await deleteUser(user);
        }
    } catch (error) {
        throw error;
    }
}



export const onAuthStateChange = (callback) => { // for real-time authentication state changes
    onAuthStateChanged(auth, callback);
}