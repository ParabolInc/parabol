/*
 * Takes a guess at what the cards are talking about.
 * If that fails, just gives them a generic name
 */
import getRethink from 'server/database/rethinkDriver';
import getEntityNameArrFromResponses from 'server/graphql/mutations/helpers/autoGroup/getEntityNameArrFromResponses';
import computeDistanceMatrix from 'server/graphql/mutations/helpers/autoGroup/computeDistanceMatrix';
import getTitleFromComputedGroup from 'server/graphql/mutations/helpers/autoGroup/getTitleFromComputedGroup';

const makeRetroGroupTitle = async (meetingId, reflections) => {
  const r = getRethink();

  const allReflectionEntities = reflections.map(({entities}) => entities);
  const entityNameArr = getEntityNameArrFromResponses(allReflectionEntities);

  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, entityNameArr);
  const smartTitle = getTitleFromComputedGroup(entityNameArr, distanceMatrix);
  if (smartTitle) {
    // need to filter out the current group if we want to check for dupes. but a dupe is good, it makes it obvious they should be merged
    // const allTitles = await r.table('RetroReflectionGroup')
    //   .getAll(meetingId, {index: 'meetingId'})
    //   .filter({isActive: true})('title')
    //   .default([]);
    // if (!allTitles.includes(smartTitle)) {
    //   console.log('not unique name');
    return {smartTitle, title: smartTitle};
    // }
  }
  const reflectionCount = await r.table('RetroReflectionGroup')
    .getAll(meetingId, {index: 'meetingId'})
    .count();
  const nextCount = reflectionCount + 1;
  return {title: `Group #${nextCount}`};
};

export default makeRetroGroupTitle;
