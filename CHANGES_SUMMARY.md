# Critical Bug Fix: User Display Name Issue

## Problem Identified
The ProblemDetail page was displaying the **logged-in user's display name** instead of the **problem author's display name**. This was a critical bug that made it impossible to identify who created each problem.

## Root Cause
- User data was only stored in Firebase Auth
- Problem documents only stored `userId`, not `userName`
- No way to fetch other users' display names without their auth tokens

## Solution Implemented

### 1. Created User Database in Firestore
**New Files:**
- `src/firebase/userHandler.js` - User profile CRUD operations
- `src/utils/migrateUsers.js` - Migration script
- `src/components/MigrationTool.jsx` - Migration UI component
- `src/MigrationPage.jsx` - Migration page
- `MIGRATION_GUIDE.md` - Detailed migration documentation

### 2. Updated Authentication Flow
**Modified:** `src/firebase/auth.js`
- Signup now creates both Firebase Auth user AND Firestore profile
- User profile includes: `displayName`, `email`, `createdAt`, `updatedAt`

### 3. Updated Problem Creation
**Modified:** 
- `src/firebase/problemHandler.js` - `addProblem()` now requires `userName` parameter
- `src/PostProblem.jsx` - Passes `user.displayName` when creating problems

### 4. Fixed Display Bug
**Modified:** `src/ProblemDetail.jsx`
- Changed from: `{user?.displayName}` (logged-in user)
- Changed to: `{problem?.userName || "Unknown"}` (problem author)

### 5. Added Migration Route
**Modified:** `src/main.jsx`
- Added `/migrate` route for running the migration tool

## Files Created
1. `src/firebase/userHandler.js` - User profile management
2. `src/utils/migrateUsers.js` - Migration logic
3. `src/components/MigrationTool.jsx` - Migration UI
4. `src/MigrationPage.jsx` - Migration page
5. `MIGRATION_GUIDE.md` - Migration documentation
6. `CHANGES_SUMMARY.md` - This file

## Files Modified
1. `src/firebase/auth.js` - Added user profile creation on signup
2. `src/firebase/problemHandler.js` - Added userName to problem documents
3. `src/PostProblem.jsx` - Pass userName when creating problems
4. `src/ProblemDetail.jsx` - Display problem author's name
5. `src/main.jsx` - Added migration route

## Immediate Action Required

### Run the Migration
Navigate to `http://localhost:5173/migrate` and click "Run Migration" to:
1. Create Firestore profiles for existing users
2. Migrate user data from comments (which already store userName)
3. Prepare the database for the new structure

### Expected Results After Migration
- ✅ New signups automatically create Firestore profiles
- ✅ New problems store the author's userName
- ✅ ProblemDetail page shows the correct author name
- ⚠️ Old problems (before this fix) will show "Unknown" until backfilled

## Testing Checklist
- [ ] Run migration at `/migrate`
- [ ] Create a new user account
- [ ] Verify user profile created in Firestore
- [ ] Create a new problem
- [ ] Verify problem has `userName` field
- [ ] View the problem detail page
- [ ] Confirm author name displays correctly (not logged-in user's name)

## Future Considerations
1. **Backfill old problems**: Create a script to add `userName` to old problems
2. **User profiles**: Consider adding user profile pages
3. **User search**: Enable searching for users by name
4. **User mentions**: Add @mention functionality in comments

## Database Schema Changes

### New Collection: `users`
```javascript
{
  id: "user_uid",
  displayName: "john_doe_123456",
  email: "john@example.com",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Updated Collection: `problems`
```javascript
{
  // ... existing fields
  userId: "user_uid",
  userName: "john_doe_123456",  // ← NEW FIELD
  // ... other fields
}
```

## Security Rules Needed
Add to Firestore security rules:
```javascript
match /users/{userId} {
  allow read: if true;
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if false;
}
```
