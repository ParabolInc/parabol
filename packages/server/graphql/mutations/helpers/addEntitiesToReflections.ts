import getEntitiesFromText from './autoGroup/getEntitiesFromText'
import getRethink from '../../../database/rethinkDriver'
import extractTextFromDraftString from '../../../../client/utils/draftjs/extractTextFromDraftString'
import promiseAllPartial from '../../../../client/utils/promiseAllPartial'
import sanitizeAnalyzedEntitiesResponse from './autoGroup/sanitizeAnalyzedEntititesResponse'
import promiseAllObj from '../../../../client/utils/promiseAllObj'
import getSyntaxFromText from './autoGroup/getSyntaxFromText'
import addLemmaToEntities from './autoGroup/addLemmaToEntities'
import sendToSentry from '../../../utils/sendToSentry'

const catchHandler = (e: Error) => {
  const re = /the language \S+ is not supported/i
  if (!re.test(e.message)) {
    sendToSentry(new Error(`Grouping Error: Google NLP: ${e.message}`))
  }
  return null
}

const addEntitiesToReflections = async (meetingId) => {
  const r = getRethink()
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter((reflection) => {
      return r.and(reflection('isActive').eq(true), reflection.hasFields('entities').not())
    })

  // get text for each reflection
  const contentTexts = reflections.map((reflection) =>
    extractTextFromDraftString(reflection.content)
  )

  // intelligently extract the entities from the body of the text
  const {reflectionResponses, reflectionSyntax} = await promiseAllObj({
    reflectionResponses: promiseAllPartial(contentTexts.map(getEntitiesFromText), catchHandler),
    reflectionSyntax: promiseAllPartial(contentTexts.map(getSyntaxFromText), catchHandler)
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
  const nextReflections = reflections.map((reflection, idx) => ({
    id: reflection.id,
    entities: responsesWithLemma[idx]
  }))

  return r(nextReflections).forEach((reflection) => {
    return r
      .table('RetroReflection')
      .get(reflection('id'))
      .update({entities: reflection('entities')})
  })
}

export default addEntitiesToReflections
