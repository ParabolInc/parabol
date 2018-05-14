import getEntitiesFromText from 'server/graphql/mutations/helpers/autoGroup/getEntitiesFromText';
import getRethink from 'server/database/rethinkDriver';
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString';
import promiseAllPartial from 'universal/utils/promiseAllPartial';
import sanitizeAnalyzedEntitiesResponse from 'server/graphql/mutations/helpers/autoGroup/sanitizeAnalyzedEntititesResponse';
import promiseAllObj from 'universal/utils/promiseAllObj';
import getSyntaxFromText from 'server/graphql/mutations/helpers/autoGroup/getSyntaxFromText';
import addLemmaToEntities from 'server/graphql/mutations/helpers/autoGroup/addLemmaToEntities';

const addEntitiesToReflections = async (meetingId) => {
  const r = getRethink();
  const reflections = await r.table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter((reflection) => {
      return r.and(
        reflection('isActive').eq(true),
        reflection.hasFields('entities').not()
      );
    });

  // get text for each reflection
  const contentTexts = reflections.map((reflection) => extractTextFromDraftString(reflection.content));

  // intelligently extract the entities from the body of the text
  const {reflectionResponses, reflectionSyntax} = await promiseAllObj({
    reflectionResponses: promiseAllPartial(contentTexts.map(getEntitiesFromText)),
    reflectionSyntax: promiseAllPartial(contentTexts.map(getSyntaxFromText))
  });

  // for each entity, look in the tokens array to first the first word of the entity
  // for each word in the entity, make sure that the next token points to it, else continue, return entity starting index
  // take the lemma of the last word and recompute the entity based on that lemma
  // run a distance matrix on the lemma
  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponses = reflectionResponses.map(sanitizeAnalyzedEntitiesResponse);
  const responsesWithLemma = sanitizedReflectionResponses.map((response, idx) => addLemmaToEntities(response, reflectionSyntax[idx]));
  const nextReflections = reflections.map((reflection, idx) => ({
    id: reflection.id,
    entities: responsesWithLemma[idx]
  }));

  return r(nextReflections).forEach((reflection) => {
    return r.table('RetroReflection')
      .get(reflection('id'))
      .update({entities: reflection('entities')});
  });
};

export default addEntitiesToReflections;
