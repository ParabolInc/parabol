import {GoogleAnalyzedEntity} from '../../public/resolverTypes'

const getBasicLemma = (word: string): string => {
  const lowerWord = word.toLowerCase()
  // Common English suffixes -> approximate roots
  if (lowerWord.endsWith('ing')) return lowerWord.slice(0, -3)
  if (lowerWord.endsWith('ed')) return lowerWord.slice(0, -2)
  if (lowerWord.endsWith('ies')) return lowerWord.slice(0, -3) + 'y'
  if (lowerWord.endsWith('es')) return lowerWord.slice(0, -2)
  if (lowerWord.endsWith('s')) return lowerWord.slice(0, -1)
  return lowerWord
}

const getReflectionEntities = async (plaintextContent: string): Promise<GoogleAnalyzedEntity[]> => {
  if (!plaintextContent) return []

  const words = plaintextContent
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)

  const lemmaGroups = new Map<string, string[]>()
  for (const word of words) {
    const lemma = getBasicLemma(word)
    if (!lemmaGroups.has(lemma)) lemmaGroups.set(lemma, [])
    lemmaGroups.get(lemma)!.push(word)
  }

  return Array.from(lemmaGroups.entries()).map(([lemma, forms]) => ({
    name: forms[0] ?? '',
    lemma,
    salience: 1 / words.length
  }))
}

export default getReflectionEntities
