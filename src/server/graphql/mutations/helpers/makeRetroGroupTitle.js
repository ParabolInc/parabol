/*
 * Takes a guess at what the cards are talking about.
 * If that fails, just gives them a generic name
 */
import getEntityNameArrFromResponses from 'server/graphql/mutations/helpers/autoGroup/getEntityNameArrFromResponses';
import computeDistanceMatrix from 'server/graphql/mutations/helpers/autoGroup/computeDistanceMatrix';
import getTitleFromComputedGroup from 'server/graphql/mutations/helpers/autoGroup/getTitleFromComputedGroup';
import extractTextFromDraftString from 'universal/utils/draftjs/extractTextFromDraftString';

const makeRetroGroupTitle = (meetingId, reflections) => {
  const allReflectionEntities = reflections.map(({entities}) => entities).filter(Boolean);
  const entityNameArr = getEntityNameArrFromResponses(allReflectionEntities);

  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, entityNameArr);
  const smartTitle = getTitleFromComputedGroup(entityNameArr, distanceMatrix);
  if (smartTitle) {
    // need to filter out the current group if we want to check for dupes. but a dupe is good, it makes it obvious they should be merged
    return {smartTitle, title: smartTitle};
  }
  const title = reflections[0] ? extractTextFromDraftString(reflections[0].content).slice(0, 20) : 'Unnamed group';
  return {title};
};

export default makeRetroGroupTitle;
