import getEntitiesFromText from './autoGroup/getEntitiesFromText'
import sanitizeAnalyzedEntitiesResponse from './autoGroup/sanitizeAnalyzedEntititesResponse'
import getSyntaxFromText from './autoGroup/getSyntaxFromText'
import addLemmaToEntities from './autoGroup/addLemmaToEntities'
import sendToSentry from '../../../utils/sendToSentry'

const catchHandler = (e: Error) => {
  const re = /the language \S+ is not supported/i
  if (!re.test(e.message)) {
    sendToSentry(new Error(`Grouping Error: Google NLP: ${e.message}`))
  }
}

const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []
  const res = await Promise.all([
    getEntitiesFromText(plaintextContent),
    getSyntaxFromText(plaintextContent)
  ]).catch(catchHandler)

  if (!res) return []
  const [reflectionResponse, reflectionSyntax] = res
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
