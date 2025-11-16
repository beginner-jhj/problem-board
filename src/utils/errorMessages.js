const errorMap = {
  // Firebase Auth errors
  'auth/invalid-email': 'Invalid email format',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/invalid-credential': 'Invalid email or password',
  'auth/weak-password': 'Password must be at least 6 characters',
  'auth/email-already-in-use': 'This email is already registered',
  'auth/operation-not-allowed': 'This operation is currently disabled',
  'auth/too-many-requests': 'Too many attempts. Try again later',
  'auth/unauthenticated': 'You must be logged in',
  'auth/invalid-user': 'Invalid user information',
  'auth/invalid-display-name': 'Name is required',
  'auth/invalid-password': 'Password is required',
  'auth/account-exists-with-different-credential': 'Account exists with different credentials',
  
  // Database errors
  'db/not-found': 'The requested item was not found',
  'db/permission-denied': 'You do not have permission',
  'db/write-failed': 'Failed to save data',
  'db/read-failed': 'Failed to load data',
  'db/delete-failed': 'Failed to delete data',
  'db/update-failed': 'Failed to update data',
  
  // Problem errors
  'problem/invalid-id': 'Invalid problem ID',
  'problem/invalid-args': 'Invalid problem data',
  'problem/missing-fields': 'Please fill in all required fields',
  'problem/invalid-category': 'Invalid category',
  'problem/no-updates': 'Nothing to update',
  'problem/not-found': 'Problem not found',
  'problem/delete-failed': 'Failed to delete problem',
  'problem/permission-denied': 'You do not have permission to modify this problem',
  'problem/create-failed': 'Failed to create problem',
  
  // Comment errors
  'comment/invalid-id': 'Invalid comment ID',
  'comment/invalid-args': 'Invalid comment data',
  'comment/empty': 'Comment cannot be empty',
  'comment/invalid-problem': 'Invalid problem reference',
  'comment/not-found': 'Comment not found',
  'comment/delete-failed': 'Failed to delete comment',
  'comment/permission-denied': 'You do not have permission to modify this comment',
  'comment/create-failed': 'Failed to post comment',
  'comment/update-failed': 'Failed to update comment',
  
  // User errors
  'user/missing-name': 'User name is required',
  'user/profile-not-found': 'User profile not found',
  'user/profile-create-failed': 'Failed to create user profile',
  'user/profile-delete-failed': 'Failed to delete user profile',
  'user/delete-failed': 'Failed to delete account',
  'user/reauthentication-failed': 'Reauthentication failed. Incorrect password.',
  
  // Validation errors
  'validation/missing-fields': 'Please fill in all required fields',
  'validation/invalid-email': 'Invalid email address',
  'validation/password-too-short': 'Password must be at least 6 characters',
  
  // Generic errors
  'app/unknown-error': 'Something went wrong',
  'app/network-error': 'Network error. Please check your connection',
};

export function getErrorMessage(error) {
  if (!error) return 'An error occurred';
  
  // Handle error object with code property
  const code = error.code || error;
  const mapped = errorMap[code];
  
  if (mapped) return mapped;
  
  // Fallback to error.message if it exists
  if (typeof error === 'object' && error.message && error.message !== code) {
    return error.message;
  }
  
  return errorMap['app/unknown-error'];
}
