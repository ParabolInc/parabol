import {GoogleAnalyzedSyntax} from '../../../../GoogleLanguageManager'

const getTokenIndices = (entityName: string, tokens: GoogleAnalyzedSyntax['tokens']) => {
  const indices = [] as {start: number; end: number}[]
  // assumes already lowercased
  const namePieces = entityName.split(' ')
  const [firstPiece] = namePieces
  for (let jj = 0; jj < tokens.length; jj++) {
    const token = tokens[jj]!
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

export const addLemmaToEntity = (entityName: string, tokens: GoogleAnalyzedSyntax['tokens']) => {
  const tokenIndices = getTokenIndices(entityName, tokens)
  if (tokenIndices.length === 0) return entityName
  // we only care about the first match since the lemma will be the same for all
  const firstTokenIdx = tokenIndices[0]!
  const {end} = firstTokenIdx
  const {lemma: partialLemma} = tokens[end]!
  const namePieces = entityName.split(' ')
  namePieces[namePieces.length - 1] = partialLemma
  return namePieces.join(' ').toLowerCase()
}

interface EntityWithoutLemma {
  name: string
  salience: number // 0 - 1
}

const addLemmaToEntities = (
  entities: EntityWithoutLemma[],
  syntax: GoogleAnalyzedSyntax | null
) => {
  const tokens = syntax?.tokens
  return entities.map((entity) => ({
    ...entity,
    lemma: tokens ? addLemmaToEntity(entity.name, tokens) : ''
  }))
}

export default addLemmaToEntities
