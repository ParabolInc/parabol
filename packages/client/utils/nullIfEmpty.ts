/*
 * Returns null if the array is empty
 * Useful when a function is using filter behind the scenes
 */
const nullIfEmpty = <T = unknown>(arr: T[]) => {
  return arr.length > 0 ? arr : null
}

export default nullIfEmpty
