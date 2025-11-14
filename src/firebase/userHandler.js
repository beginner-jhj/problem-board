import {
  collection,
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
    assert(userId && typeof userId === 'string', 'auth/invalid-user', 'User ID is required');
    assert(userData && typeof userData === 'object', 'user/invalid-data', 'User data is required');
    assert(userData.displayName, 'user/missing-displayname', 'Display name is required');
    assert(userData.email, 'user/missing-email', 'Email is required');

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      displayName: userData.displayName,
      email: userData.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Get a user profile by user ID
 * @param {string} userId - The user's UID
 */
export const getUserProfile = async (userId) => {
  try {
    assert(userId && typeof userId === 'string', 'auth/invalid-user', 'User ID is required');
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data(),
      };
    } else {
      throw appError('db/not-found', 'User profile not found');
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
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
    assert(userId && typeof userId === 'string', 'auth/invalid-user', 'User ID is required');
    assert(updates && typeof updates === 'object', 'user/invalid-data', 'Update data is required');
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw appError('db/not-found', 'User profile not found');
    }
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};
