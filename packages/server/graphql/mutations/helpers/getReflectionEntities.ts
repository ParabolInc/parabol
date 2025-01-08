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

const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []

  // E.g. “Documenting things in Notion” => [‘documenting’, ‘things’, ‘notion’]
  const words = plaintextContent
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)

  // Group words by their lemma
  const lemmaGroups = new Map<string, string[]>()
  for (const word of words) {
    const lemma = getBasicLemma(word)
    if (!lemmaGroups.has(lemma)) {
      lemmaGroups.set(lemma, [])
    }
    lemmaGroups.get(lemma)!.push(word)
  }

  // Build the same shape the tests expect
  const entities = Array.from(lemmaGroups.entries()).map(([lemma, forms]) => ({
    name: forms[0], // e.g. “documenting”
    salience: 1 / words.length,
    lemma // e.g. “document”
  }))

  return entities
}

export default getReflectionEntities
