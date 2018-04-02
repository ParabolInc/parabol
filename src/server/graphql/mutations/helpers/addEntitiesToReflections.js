import getEntitiesFromText from 'server/graphql/mutations/helpers/autoGroup/getEntitiesFromText';
import getRethink from 'server/database/rethinkDriver';
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString';
import promiseAllPartial from 'universal/utils/promiseAllPartial';
import sanitizeAnalyzedEntitiesResponse from 'server/graphql/mutations/helpers/autoGroup/sanitizeAnalyzedEntititesResponse';

const addEntitiesToReflections = async (meetingId) => {
  const r = getRethink();
  const reflections = await r.table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter((reflection) => {
      return r.and(
        reflection('isActive').eq(true),
        reflection('entities').ne(null)
      );
    });

  // get text for each reflection
  const contentTexts = reflections.map((reflection) => extractTextFromDraftString(reflection.content));

  // intelligently extract the entities from the body of the text
  const reflectionResponses = await promiseAllPartial(contentTexts.map(getEntitiesFromText));

  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponses = reflectionResponses.map(sanitizeAnalyzedEntitiesResponse);

  const nextReflections = reflections.map((reflection, idx) => ({
    id: reflection.id,
    entities: sanitizedReflectionResponses[idx]
  }));

  return r(nextReflections).forEach((reflection) => {
    return r.table('RetroReflection')
      .get(reflection('id'))
      .update({entities: reflection('entities')});
  });
};

export default addEntitiesToReflections;
