import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import manageGoogleNLPErrorResponse from './manageGoogleNLPErrorResponse'
import addLemmaToEntities from './autoGroup/addLemmaToEntities'
import sanitizeAnalyzedEntitiesResponse from './autoGroup/sanitizeAnalyzedEntititesResponse'

const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []
  const manager = getGoogleLanguageManager()
  const res = await Promise.all([
    manager.analyzeEntities(plaintextContent),
    manager.analyzeSyntax(plaintextContent)
  ])
  const reflectionResponse = manageGoogleNLPErrorResponse(res[0])
  const reflectionSyntax = manageGoogleNLPErrorResponse(res[1])
  // for each entity, look in the tokens array to first the first word of the entity
  // for each word in the entity, make sure that the next token points to it, else continue, return entity starting index
  // take the lemma of the last word and recompute the entity based on that lemma
  // run a distance matrix on the lemma
  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponse = sanitizeAnalyzedEntitiesResponse(reflectionResponse)
  if (!sanitizedReflectionResponse) return []
  return addLemmaToEntities(sanitizedReflectionResponse, reflectionSyntax)
}

export default getReflectionEntities
