# User Database Migration Guide

## Overview
This guide explains the migration from storing user data only in Firebase Auth to also storing user profiles in Firestore.

## Why This Migration?
Previously, the application displayed the logged-in user's display name instead of the problem author's name on the ProblemDetail page. This was a critical bug because:
- User information was only stored in Firebase Auth
- We couldn't fetch other users' display names without their auth tokens
- The problem documents didn't store the author's name

## Changes Made

### 1. Created Users Collection in Firestore
- **File**: `src/firebase/userHandler.js`
- **Purpose**: Manage user profiles in Firestore
- **Functions**:
  - `createUserProfile(userId, userData)` - Create a new user profile
  - `getUserProfile(userId)` - Fetch a user profile by ID
  - `updateUserProfile(userId, updates)` - Update user profile

### 2. Updated Signup Process
- **File**: `src/firebase/auth.js`
- **Change**: Now creates a Firestore user profile when a user signs up
- **Data Stored**: `displayName`, `email`, `createdAt`, `updatedAt`

### 3. Updated Problem Creation
- **File**: `src/firebase/problemHandler.js`
- **Change**: `addProblem()` now requires and stores `userName`
- **File**: `src/PostProblem.jsx`
- **Change**: Passes `user.displayName` when creating problems

### 4. Fixed ProblemDetail Display
- **File**: `src/ProblemDetail.jsx`
- **Change**: Now displays `problem?.userName` instead of `user?.displayName`
- **Result**: Shows the problem author's name, not the logged-in user's name

### 5. Created Migration Tools
- **File**: `src/utils/migrateUsers.js` - Migration script
- **File**: `src/components/MigrationTool.jsx` - UI component
- **File**: `src/MigrationPage.jsx` - Dedicated migration page
- **Route**: `/migrate` - Access the migration tool

## How to Run the Migration

### ⚠️ Important: Firebase Auth Limitation
Firebase Auth doesn't allow querying other users' data without the Admin SDK. This means we **cannot** automatically migrate all users at once. Instead, we have two approaches:

### Approach 1: Automatic Migration on Login (Recommended - Already Implemented!)
**No action needed!** The system now automatically creates Firestore profiles when users log in:
- When any user logs in, the system checks if they have a Firestore profile
- If not, it automatically creates one using their Firebase Auth data
- This happens in the background without user intervention

**Result**: Existing users will get their profiles created the next time they log in!

### Approach 2: Manual Migration via Web UI
For immediate migration or troubleshooting:

1. Start your development server
2. Navigate to `http://localhost:5173/migrate`
3. Choose one of two options:

#### Option A: Migrate Current User
- Log in with your account
- Click "Migrate My Profile"
- Your Firestore profile will be created immediately
- Each user needs to do this for themselves

#### Option B: Migrate from Comments
- Click "Migrate from Comments"
- Extracts user data from existing comments (which store userName)
- Only works if there are comments in the database
- Creates profiles for all users who have commented

## What the Migration Does

### Automatic Migration (on login):
1. User logs in via Firebase Auth
2. System checks if Firestore profile exists
3. If not, creates profile with:
   - `displayName` from Firebase Auth
   - `email` from Firebase Auth
   - `createdAt` and `updatedAt` timestamps

### Manual Migration from Comments:
1. **Scans comment data**:
   - Reads all comments to extract user IDs and userNames
   - Comments already store `userName` field

2. **Creates user profiles**:
   - For each user found in comments, creates a Firestore profile
   - Skips users who already have profiles
   - Uses placeholder email for migrated users

3. **Reports results**:
   - Number of users migrated
   - Number of users skipped (already exist)
   - Number of errors

## Important Notes

### For Existing Problems
- Old problems created before this update won't have `userName` field
- The ProblemDetail page will display "Unknown" for these problems
- You may need to manually update old problems or create a separate migration for them

### For New Users
- All new signups automatically create Firestore profiles
- No manual intervention needed

### For New Problems
- All new problems automatically store the author's `userName`
- Display name will show correctly on ProblemDetail page

## Database Structure

### Users Collection (`users`)
```javascript
{
  displayName: "john_doe_123456",
  email: "john@example.com",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Problems Collection (Updated)
```javascript
{
  // ... existing fields
  userId: "user_uid",
  userName: "john_doe_123456",  // NEW FIELD
  // ... other fields
}
```

## Troubleshooting

### Migration shows errors
- Check browser console for detailed error messages
- Ensure Firestore security rules allow writes to `users` collection
- Verify Firebase configuration is correct

### Old problems still show "Unknown"
- This is expected for problems created before the migration
- Consider running a separate script to backfill `userName` for old problems

### New problems not showing author name
- Verify the user has a `displayName` in Firebase Auth
- Check that `addProblem()` is being called with `userName` parameter
- Ensure the problem document has the `userName` field in Firestore

## Security Considerations

### Firestore Security Rules
Make sure to add appropriate security rules for the `users` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Allow users to read any user profile
      allow read: if true;
      
      // Allow users to create/update only their own profile
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // Prevent deletion
      allow delete: if false;
    }
  }
}
```

## Next Steps

1. Run the migration immediately to fix existing data
2. Test the ProblemDetail page to verify author names display correctly
3. Monitor for any issues with new user signups
4. Consider adding user profile pages in the future
5. Consider backfilling `userName` for old problems if needed

## Support

If you encounter any issues during migration, please check:
- Firebase console for Firestore data
- Browser console for JavaScript errors
- Network tab for failed API calls
