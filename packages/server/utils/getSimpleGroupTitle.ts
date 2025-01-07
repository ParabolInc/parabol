export const getSimpleGroupTitle = (plaintextContent: string) => {
  // Take first 2-3 significant words
  const words = plaintextContent
    .split(/\s+/)
    .filter((word) => word.length > 3) // Skip small words
    .slice(0, 3)
    .join(' ')
    .toLowerCase()

  return words.length > 0 ? words : 'New Group'
}
