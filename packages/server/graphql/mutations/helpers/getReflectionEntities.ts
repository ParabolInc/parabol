import getGoogleLanguageManager from '../../../getGoogleLanguageManager'
import {GoogleErrorResponse} from '../../../GoogleLanguageManager'
import sendToSentry from '../../../utils/sendToSentry'
import addLemmaToEntities from './autoGroup/addLemmaToEntities'
import sanitizeAnalyzedEntitiesResponse from './autoGroup/sanitizeAnalyzedEntititesResponse'

const manageErrorResponse = <T>(res: T) => {
  if (Array.isArray(res)) {
    const [firstError] = res
    if (firstError) {
      const {error} = firstError
      if (error) {
        const {message} = error
        if (message !== 'No JWT provided') {
          const re = /language \S+ is not supported/
          if (!re.test(message)) {
            sendToSentry(new Error(`Grouping Error: Google NLP: ${message}`))
          }
        }
      }
    }
    return null
  }
  return res as T extends GoogleErrorResponse ? never : T
}

const getReflectionEntities = async (plaintextContent: string) => {
  if (!plaintextContent) return []
  const manager = getGoogleLanguageManager()
  const res = await Promise.all([
    manager.analyzeEntities(plaintextContent),
    manager.analyzeSyntax(plaintextContent)
  ])
  const reflectionResponse = manageErrorResponse(res[0])
  const reflectionSyntax = manageErrorResponse(res[1])
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
