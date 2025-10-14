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
  
  // Database errors
  'db/not-found': 'The requested item was not found',
  'db/permission-denied': 'You do not have permission',
  
  // Problem errors
  'problem/invalid-id': 'Invalid problem ID',
  'problem/invalid-args': 'Invalid problem data',
  'problem/missing-fields': 'Please fill in all required fields',
  'problem/invalid-category': 'Invalid category',
  'problem/no-updates': 'Nothing to update',
  
  // Comment errors
  'comment/invalid-id': 'Invalid comment ID',
  'comment/invalid-args': 'Invalid comment data',
  'comment/empty': 'Comment cannot be empty',
  'comment/invalid-problem': 'Invalid problem reference',
};

export function getErrorMessage(error) {
  if (!error) return 'An error occurred';
  
  const code = error.code || error;
  const mapped = errorMap[code];
  
  if (mapped) return mapped;
  
  // Fallback to error.message or a generic message
  if (typeof error === 'object' && error.message) {
    return error.message;
  }
  
  return 'Something went wrong';
}
