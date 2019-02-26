import addLemmaToEntities from 'server/graphql/mutations/helpers/autoGroup/addLemmaToEntities'
import getEntitiesFromText from 'server/graphql/mutations/helpers/autoGroup/getEntitiesFromText'
import getSyntaxFromText from 'server/graphql/mutations/helpers/autoGroup/getSyntaxFromText'
import sanitizeAnalyzedEntitiesResponse from 'server/graphql/mutations/helpers/autoGroup/sanitizeAnalyzedEntititesResponse'
import promiseAllObj from 'universal/utils/promiseAllObj'
import promiseAllPartial from 'universal/utils/promiseAllPartial'
import sendToSentry from './utils/sendToSentry'

const catchHandler = (e: Error) => {
  const re = /the language \S+ is not supported/
  if (!re.test(e.message)) {
    sendToSentry(new Error(`Demo Error: Google NLP: ${e.message}`))
  }
  return null
}

const demoEntityHandler = async (req, res) => {
  if (!req.body || !Array.isArray(req.body.texts)) {
    res.sendStatus(404)
    return
  }
  const texts = req.body.texts as Array<string>
  // intelligently extract the entities from the body of the text
  const {reflectionResponses, reflectionSyntax} = await promiseAllObj({
    reflectionResponses: promiseAllPartial(texts.map(getEntitiesFromText), catchHandler),
    reflectionSyntax: promiseAllPartial(texts.map(getSyntaxFromText), catchHandler)
  })

  // for each entity, look in the tokens array to first the first word of the entity
  // for each word in the entity, make sure that the next token points to it, else continue, return entity starting index
  // take the lemma of the last word and recompute the entity based on that lemma
  // run a distance matrix on the lemma
  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponses = reflectionResponses.map(sanitizeAnalyzedEntitiesResponse)
  const responsesWithLemma = sanitizedReflectionResponses.map((response, idx) =>
    addLemmaToEntities(response, reflectionSyntax[idx])
  )
  res.send(JSON.stringify(responsesWithLemma))
}

export default demoEntityHandler
