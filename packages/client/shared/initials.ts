/** Always returns exactly 2 characters: `fallback` when the name has no usable letters */
export const initials = (name: string, fallback = '??') => {
  const words = name
    .replace(/[^A-Za-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  const first = words[0]
  if (!first) return fallback
  const letters = words.length === 1 ? first.slice(0, 2) : first[0]! + words[1]![0]!
  return (letters.length === 1 ? letters.repeat(2) : letters).toUpperCase()
}
