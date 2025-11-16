import {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./app";
import { assert, appError } from "../utils/appError";

/**
 * Create a new user profile in Firestore
 * @param {string} userId - The user's UID from Firebase Auth
 * @param {Object} userData - User data including displayName, email
 */
export const createUserProfile = async (userId, userData) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user');
    assert(userData && typeof userData === 'object', 'user/invalid-data');
    assert(userData.displayName, 'user/missing-displayname');
    assert(userData.email, 'user/missing-email');

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      displayName: userData.displayName,
      email: userData.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

/**
 * Get a user profile by user ID
 * @param {string} userId - The user's UID
 */
export const getUserProfile = async (userId) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user');
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      throw appError('user/profile-not-found');
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Update a user profile
 * @param {string} userId - The user's UID
 * @param {Object} updates - Fields to update
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user');
    assert(updates && typeof updates === 'object', 'user/invalid-data');
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw appError('user/profile-not-found');
    }
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const deleteUserProfile = async (userId) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user');
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await deleteDoc(userRef);
      return { success: true };
    } else {
      throw appError('user/profile-not-found');
    }
  } catch (error) {
    throw error;
  }
}
