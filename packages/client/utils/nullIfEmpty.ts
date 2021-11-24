/*
 * Returns null if the array is empty
 * Useful when a function is using filter behind the scenes
 */
const nullIfEmpty = (arr: unknown[]) => {
  return arr.length > 0 ? arr : null
}

export default nullIfEmpty
