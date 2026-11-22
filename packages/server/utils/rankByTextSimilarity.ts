const tokenize = (text: string) =>
  (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((token) => token.length > 1)

// Okapi BM25 keyword ranking; ties keep the candidates' given order.
// Written here on purpose. On a replay of 250 of our own poker rounds (#14343):
// - Harrier embeddings picked no better reference stories than this.
// - MiniSearch keeps only about 8 of these top 10, even tuned, because it scores BM25+
//   and counts a story's length in distinct words. Free orgs' estimates got worse with it
//   (1.17 steps off vs 1.11).
const rankByTextSimilarity = <T>(
  query: string,
  candidates: T[],
  getText: (candidate: T) => string
) => {
  const k1 = 1.2
  const b = 0.75
  const candidateTokens = candidates.map((candidate) => tokenize(getText(candidate)))
  const averageLength =
    candidateTokens.reduce((sum, tokens) => sum + tokens.length, 0) / Math.max(1, candidates.length)
  const documentFrequency = new Map<string, number>()
  for (const tokens of candidateTokens) {
    for (const token of new Set(tokens)) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1)
    }
  }
  const queryTokens = [...new Set(tokenize(query))]
  const scores = candidateTokens.map((tokens) => {
    const termFrequency = new Map<string, number>()
    for (const token of tokens) termFrequency.set(token, (termFrequency.get(token) ?? 0) + 1)
    const lengthNorm = 1 - b + (b * tokens.length) / averageLength
    return queryTokens.reduce((score, token) => {
      const frequency = termFrequency.get(token)
      if (!frequency) return score
      const matches = documentFrequency.get(token)!
      const idf = Math.log(1 + (candidates.length - matches + 0.5) / (matches + 0.5))
      return score + (idf * frequency * (k1 + 1)) / (frequency + k1 * lengthNorm)
    }, 0)
  })
  return candidates
    .map((candidate, index) => ({candidate, score: scores[index]!, index}))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({candidate}) => candidate)
}

export default rankByTextSimilarity
