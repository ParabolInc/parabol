import getAllLemmasFromReflections from 'universal/utils/autogroup/getAllLemmasFromReflections'
import computeDistanceMatrix from 'universal/utils/autogroup/computeDistanceMatrix'
import getGroupMatrix from 'server/graphql/mutations/helpers/autoGroup/getGroupMatrix'
import getTitleFromComputedGroup from 'universal/utils/autogroup/getTitleFromComputedGroup'

/*
 * Read each reflection, parse the content for entities (i.e. nouns), group the reflections based on common themes
 */
const groupReflections = (reflections, groupingThreshold) => {
  const allReflectionEntities = reflections.map(({entities}) => entities)
  const oldReflectionGroupIds = reflections.map(({reflectionGroupId}) => reflectionGroupId)

  // create a unique array of all entity names mentioned in the meeting's reflect phase
  const uniqueLemmaArr = getAllLemmasFromReflections(allReflectionEntities)
  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, uniqueLemmaArr)
  const {groups: groupedArrays, thresh, nextThresh} = getGroupMatrix(
    distanceMatrix,
    groupingThreshold
  )
  // replace the arrays with reflections
  const updatedReflections = []
  const updatedGroups = groupedArrays.map((group) => {
    // look up the reflection by its vector, put them all in the same group
    let reflectionGroupId = ''
    const groupedReflections = group.map((reflectionDistanceArr, sortOrder) => {
      const idx = distanceMatrix.indexOf(reflectionDistanceArr)
      const reflection = reflections[idx]
      reflectionGroupId = reflectionGroupId || reflection.reflectionGroupId
      return {
        ...reflection,
        sortOrder,
        reflectionGroupId
      }
    })

    const groupedReflectionEntities = groupedReflections
      .map(({entities}) => entities)
      .filter(Boolean)
    const smartTitle = getTitleFromComputedGroup(uniqueLemmaArr, group, groupedReflectionEntities)

    updatedReflections.push(...groupedReflections)
    return {
      id: reflectionGroupId,
      smartTitle,
      title: smartTitle
    }
  })

  const newReflectionGroupIds = new Set(
    updatedReflections.map(({reflectionGroupId}) => reflectionGroupId)
  )
  const removedReflectionGroupIds = oldReflectionGroupIds.filter(
    (groupId) => !newReflectionGroupIds.has(groupId)
  )
  return {
    autoGroupThreshold: thresh,
    groups: updatedGroups,
    groupedReflections: updatedReflections,
    removedReflectionGroupIds,
    nextThresh
  }
}

export default groupReflections
