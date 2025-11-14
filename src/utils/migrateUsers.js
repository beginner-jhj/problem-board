import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/app";
import { createUserProfile, getUserProfile } from "../firebase/userHandler";

/**
 * Migration script to create Firestore user profile for the current logged-in user
 * Since Firebase Auth doesn't allow querying other users' data without admin SDK,
 * each user needs to run this for themselves
 */
export const migrateCurrentUser = async (currentUser) => {
  try {
    if (!currentUser) {
      throw new Error("No user is currently logged in");
    }

    console.log(`Migrating current user: ${currentUser.uid}`);

    // Check if user profile already exists
    try {
      const existingProfile = await getUserProfile(currentUser.uid);
      console.log("User profile already exists:", existingProfile);
      return {
        success: true,
        alreadyExists: true,
        message: "User profile already exists",
      };
    } catch (error) {
      // Profile doesn't exist, create it
      if (error.code === "db/not-found" || error.message.includes("not found")) {
        await createUserProfile(currentUser.uid, {
          displayName: currentUser.displayName || "Unknown User",
          email: currentUser.email || "",
        });

        console.log(`Created profile for user ${currentUser.uid}`);
        return {
          success: true,
          alreadyExists: false,
          message: "User profile created successfully",
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Error during user migration:", error);
    throw error;
  }
};

/**
 * Migration script to extract user data from existing comments
 * This creates profiles for users who have commented (since comments store userName)
 */
export const migrateUsersFromComments = async () => {
  try {
    console.log("Starting migration from comments...");
    
    // Get all comments to extract user data
    const commentsSnapshot = await getDocs(collection(db, "comments"));
    const userMap = new Map(); // userId -> { userName, email }
    
    commentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.userId && data.userName) {
        userMap.set(data.userId, {
          userName: data.userName,
          email: `migrated_${data.userId}@placeholder.com`,
        });
      }
    });
    
    console.log(`Found ${userMap.size} unique users in comments`);
    
    if (userMap.size === 0) {
      return {
        success: true,
        migrated: 0,
        skipped: 0,
        errors: 0,
        message: "No comment data found. Users need to log in individually to create their profiles.",
      };
    }
    
    // Check which users already have profiles
    const usersSnapshot = await getDocs(collection(db, "users"));
    const existingUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Create user profiles for users that don't have one yet
    for (const [userId, userData] of userMap.entries()) {
      if (existingUserIds.has(userId)) {
        console.log(`User ${userId} already has a profile, skipping...`);
        skippedCount++;
        continue;
      }
      
      try {
        await createUserProfile(userId, {
          displayName: userData.userName,
          email: userData.email,
        });
        
        console.log(`Migrated user ${userId} with name ${userData.userName}`);
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating user ${userId}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration complete!`);
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped (already exists): ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);
    
    return {
      success: true,
      migrated: migratedCount,
      skipped: skippedCount,
      errors: errorCount,
      message: `Migrated ${migratedCount} users from comment data`,
    };
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};

/**
 * Helper function to check if a user profile exists
 */
export const checkUserProfileExists = async (userId) => {
  try {
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("__name__", "==", userId))
    );
    return !usersSnapshot.empty;
  } catch (error) {
    console.error("Error checking user profile:", error);
    return false;
  }
};
