/** Removes optional object properties that Firestore rejects when undefined. */
export function firestoreSafe<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => item === undefined ? null : firestoreSafe(item)) as T;
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, firestoreSafe(item)])
    ) as T;
  }
  return value;
}
