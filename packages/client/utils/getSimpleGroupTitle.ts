import {upperFirst} from './upperFirst'

export const getSimpleGroupTitle = (reflections: {plaintextContent: string}[]) => {
  // For single reflection, use first few significant words
  const combinedText = reflections.map((r) => r.plaintextContent).join(' ')

  // Take first 2-3 significant words
  const words = combinedText
    .split(/\s+/)
    .filter((word) => word.length > 3) // Skip small words
    .slice(0, 3)
    .join(' ')
    .toLowerCase()

  return words.length > 0 ? upperFirst(words) : 'New Group'
}
