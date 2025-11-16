export function appError(code) {
  const err = new Error(code);
  err.code = code || 'app/unknown-error';
  return err;
}

export function assert(condition, code) {
  if (!condition) {
    throw appError(code);
  }
}
