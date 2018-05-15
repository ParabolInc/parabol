const getTokenIndices = (entityName, tokens) => {
  const indices = []
  // assumes already lowercased
  const namePieces = entityName.split(' ')
  const [firstPiece] = namePieces
  for (let jj = 0; jj < tokens.length; jj++) {
    const token = tokens[jj]
    if (token.text.content.toLowerCase() === firstPiece) {
      let startIdxFound = true
      // make sure the rest of the pieces match
      for (let kk = 1; kk < namePieces.length; kk++) {
        const nextPiece = namePieces[kk]
        const nextToken = tokens[jj + kk]
        if (!nextToken || nextPiece !== nextToken.text.content.toLowerCase()) {
          startIdxFound = false
          break
        }
      }
      if (startIdxFound) {
        indices.push({
          start: jj,
          end: jj + namePieces.length - 1
        })
      }
    }
  }
  return indices
}

export const addLemmaToEntity = (entityName, tokens) => {
  const tokenIndices = getTokenIndices(entityName, tokens)
  if (tokenIndices.length === 0) return entityName
  // we only care about the first match since the lemma will be the same for all
  const [firstTokenIdx] = tokenIndices
  const {end} = firstTokenIdx
  const {lemma: partialLemma} = tokens[end]
  const namePieces = entityName.split(' ')
  namePieces[namePieces.length - 1] = partialLemma
  return namePieces.join(' ').toLowerCase()
}

const addLemmaToEntities = (entities, syntax) => {
  if (!entities || !syntax) return entities
  const [firstSyntax] = syntax
  if (!firstSyntax) return entities
  const {tokens} = firstSyntax
  if (!Array.isArray(tokens)) return entities
  return entities.map((entity) => ({
    ...entity,
    lemma: addLemmaToEntity(entity.name, tokens)
  }))
}

export default addLemmaToEntities
