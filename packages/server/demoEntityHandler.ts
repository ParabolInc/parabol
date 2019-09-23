import addLemmaToEntities from './graphql/mutations/helpers/autoGroup/addLemmaToEntities'
import getEntitiesFromText from './graphql/mutations/helpers/autoGroup/getEntitiesFromText'
import getSyntaxFromText from './graphql/mutations/helpers/autoGroup/getSyntaxFromText'
import sanitizeAnalyzedEntitiesResponse from './graphql/mutations/helpers/autoGroup/sanitizeAnalyzedEntititesResponse'
import promiseAllObj from '../client/utils/promiseAllObj'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import sendToSentry from './utils/sendToSentry'
import {RequestHandler} from 'express'
import GoogleAnalyzedEntity from './database/types/GoogleAnalyzedEntity'

const catchHandler = (e: Error) => {
  const re = /language \S+ is not supported/
  if (!re.test(e.message)) {
    sendToSentry(new Error(`Demo Error: Google NLP: ${e.message}`))
  }
  return null
}

const demoEntityHandler: RequestHandler = async (req, res) => {
  if (!req.body || !Array.isArray(req.body.texts)) {
    res.sendStatus(404)
    return
  }
  const texts = req.body.texts as string[]
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
  ) as GoogleAnalyzedEntity[][]
  res.send(JSON.stringify(responsesWithLemma))
}

export default demoEntityHandler
