// Checks equality ignoring object order & prototypes
export const isEqualWhenSerialized = (value1: unknown, value2: unknown): boolean => {
  // Check for strict equality first
  if (value1 === value2) return true

  // Handle cases where one is null or undefined
  if (value1 === null || value2 === null || value1 === undefined || value2 === undefined)
    return false

  // Fallback for other types (like functions, symbols, etc.)
  if (typeof value1 !== 'object' || typeof value2 !== 'object') return false

  const keys1 = Object.keys(value1)
  const keys2 = Object.keys(value2)

  // Check if both have the same number of keys
  if (keys1.length !== keys2.length) return false

  // Check if both have the same keys
  if (!keys1.every((key) => keys2.includes(key))) return false

  // Recursively check each key's value
  return keys1.every((key) =>
    isEqualWhenSerialized(value1[key as keyof typeof value1], value2[key as keyof typeof value2])
  )
}
