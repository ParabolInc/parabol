/*
 * Takes a guess at what the cards are talking about.
 * If that fails, just gives them a generic name
 */
import getAllLemmasFromReflections from 'universal/utils/autogroup/getAllLemmasFromReflections'
import computeDistanceMatrix from 'universal/utils/autogroup/computeDistanceMatrix'
import getTitleFromComputedGroup from 'universal/utils/autogroup/getTitleFromComputedGroup'
import {IRetroReflection} from 'universal/types/graphql'

const makeRetroGroupTitle = (reflections: IRetroReflection[]) => {
  const allReflectionEntities = reflections.map(({entities}) => entities).filter(Boolean)
  const uniqueLemmaArr = getAllLemmasFromReflections(allReflectionEntities)

  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, uniqueLemmaArr)
  const smartTitle = getTitleFromComputedGroup(
    uniqueLemmaArr,
    distanceMatrix,
    allReflectionEntities,
    reflections
  )
  // need to filter out the current group if we want to check for dupes. but a dupe is good, it makes it obvious they should be merged
  return {smartTitle, title: smartTitle}
}

export default makeRetroGroupTitle
