import getRethink from 'server/database/rethinkDriver'
import getAllLemmasFromReflections from 'server/graphql/mutations/helpers/autoGroup/getAllLemmasFromReflections'
import computeDistanceMatrix from 'server/graphql/mutations/helpers/autoGroup/computeDistanceMatrix'
import getGroupMatrix from 'server/graphql/mutations/helpers/autoGroup/getGroupMatrix'
import getTitleFromComputedGroup from 'server/graphql/mutations/helpers/autoGroup/getTitleFromComputedGroup'

/*
 * Read each reflection, parse the content for entities (i.e. nouns), group the reflections based on common themes
 */
const groupReflections = async (meetingId, groupingThreshold) => {
  // get reflections
  const r = getRethink()
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})

  const allReflectionEntities = reflections.map(({entities}) => entities)
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
  const removedReflectionGroupIds = []
  const updatedGroups = groupedArrays.map((group) => {
    // look up the reflection by its vector, put them all in the same group
    let reflectionGroupId = ''
    const groupedReflections = group.map((reflectionDistanceArr, sortOrder) => {
      const idx = distanceMatrix.indexOf(reflectionDistanceArr)
      const reflection = reflections[idx]
      if (reflectionGroupId) {
        removedReflectionGroupIds.push(reflection.reflectionGroupId)
      } else {
        reflectionGroupId = reflection.reflectionGroupId
      }
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

  return {
    autoGroupThreshold: thresh,
    groups: updatedGroups,
    groupedReflections: updatedReflections,
    removedReflectionGroupIds,
    nextThresh
  }
}

export default groupReflections
