const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []

  // Simple word-based entity extraction
  const words = plaintextContent
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3) // Only consider words longer than 3 chars

  const entities = words.map((word) => ({
    name: word,
    salience: 1 / words.length,
    lemma: word // Simple case - use word as its own lemma
  }))

  return entities
}

export default getReflectionEntities
