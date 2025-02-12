/**
 * For each pair of reflections, measure how many words they share
 * vs. how many unique words total. (Jaccard similarity = intersection/union).
 * We then use distance = 1 - similarity and feed that to clusterfck.
 */
export const computeJaccardDistanceMatrix = (reflections: string[]) => {
  const tokenizedReflections = reflections.map((text) => tokenize(text))

  const distanceMatrix: number[][] = tokenizedReflections.map((tokensA) => {
    return tokenizedReflections.map((tokensB) => {
      return jaccardDistance(tokensA, tokensB)
    })
  })
  return distanceMatrix
}

const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation
    .split(/\s+/)
    .filter(Boolean)
}

const jaccardDistance = (aTokens: string[], bTokens: string[]): number => {
  const setA = new Set(aTokens)
  const setB = new Set(bTokens)
  const intersectionSize = [...setA].filter((x) => setB.has(x)).length
  const unionSize = new Set([...setA, ...setB]).size
  if (unionSize === 0) return 0 // edge case, treat empty union as identical although reflections should always have text
  const similarity = intersectionSize / unionSize
  const distance = 1 - similarity
  return distance
}
