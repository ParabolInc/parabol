import getRethink from 'server/database/rethinkDriver';
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString';
import promiseAllPartial from 'universal/utils/promiseAllPartial';
import * as shortid from 'shortid';
import mode from 'universal/utils/mode';
import getEntitiesFromText from 'server/graphql/mutations/helpers/autoGroup/getEntitiesFromText';
import sanitizeAnalyzedEntitiesResponse from 'server/graphql/mutations/helpers/autoGroup/sanitizeAnalyzedEntititesResponse';
import getEntityNameArrFromResponses from 'server/graphql/mutations/helpers/autoGroup/getEntityNameArrFromResponses';
import computeDistanceMatrix from 'server/graphql/mutations/helpers/autoGroup/computeDistanceMatrix';
import getGroupMatrix from 'server/graphql/mutations/helpers/autoGroup/getGroupMatrix';
import getTitleFromComputedGroup from 'server/graphql/mutations/helpers/autoGroup/getTitleFromComputedGroup';
import sortGroupedReflections from 'server/graphql/mutations/helpers/autoGroup/sortGroupedReflections';

/*
 * Read each reflection, parse the content for entities (i.e. nouns), group the reflections based on common themes
 */
const groupReflections = async (meetingId, groupingThreshold) => {
  const now = new Date();
  // get reflections
  const r = getRethink();
  const reflections = await r.table('RetroReflection')
    .getAll(meetingId, {index: meetingId})
    .filter({isActive: true});

  // fetching entities from google is expensive. only do it if we haven't done it before
  const reflectionsWithoutEntities = reflections.filter((reflection) => !reflection.entities);
  // get text for each reflection
  const contentTexts = reflectionsWithoutEntities.map((reflection) => extractTextFromDraftString(reflection.content));

  // intelligently extract the entities from the body of the text
  const reflectionResponses = await promiseAllPartial(contentTexts.map(getEntitiesFromText));

  // sanitize reflection responses, nulling out anything without a full response tree
  const sanitizedReflectionResponses = reflectionResponses.map(sanitizeAnalyzedEntitiesResponse);
  const reflectionsWithEntities = reflections.map((reflection) => ({
    ...reflection,
    entities: reflection.entities || sanitizedReflectionResponses[reflectionsWithoutEntities.indexOf(reflection)]
  }));

  const allReflectionEntities = reflectionsWithEntities.map(({entities}) => entities);

  // create a unique array of all entity names mentioned in the meeting's reflect phase
  const entityNameArr = getEntityNameArrFromResponses(allReflectionEntities);

  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, entityNameArr);
  const {group: groupedArrays, thresh} = getGroupMatrix(distanceMatrix, groupingThreshold);

  // replace the arrays with reflections
  const updatedReflections = [];
  const newGroups = groupedArrays.map((group) => {
    const reflectionGroupId = shortid.generate();
    // look up the reflection by its vector
    const groupedReflections = group.map((reflectionDistanceArr) => {
      const idx = distanceMatrix.indexOf(reflectionDistanceArr);
      return reflectionsWithEntities[idx];
    });
    const smartTitle = getTitleFromComputedGroup(entityNameArr, group);

    // put all the reflections in the column where most of them are
    const getField = ({retroPhaseItemId}) => retroPhaseItemId;
    const retroPhaseItemIdMode = mode(groupedReflections, getField);
    const updatedReflectionsForGroup = sortGroupedReflections(groupedReflections, retroPhaseItemIdMode, reflectionGroupId);
    updatedReflections.push(...updatedReflectionsForGroup);
    return {
      id: reflectionGroupId,
      createdAt: now,
      isActive: true,
      meetingId,
      smartTitle,
      title: smartTitle,
      updatedAt: now,
      voterIds: [],
      retroPhaseItemId: retroPhaseItemIdMode
    };
  });
  return {
    autoGroupThreshold: thresh,
    groups: newGroups,
    groupedReflections: updatedReflections
  };
};

export default groupReflections;
