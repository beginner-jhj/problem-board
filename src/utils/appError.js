export function appError(code, message, details = undefined) {
  const err = new Error(message || code || 'Error');
  err.code = code || 'app/error';
  if (details !== undefined) err.details = details;
  return err;
}

export function assert(condition, code, message) {
  if (!condition) {
    throw appError(code, message);
  }
}
