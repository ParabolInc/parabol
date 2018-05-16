import getRethink from 'server/database/rethinkDriver'
import * as shortid from 'shortid'
import mode from 'universal/utils/mode'
import getAllLemmasFromReflections from 'server/graphql/mutations/helpers/autoGroup/getAllLemmasFromReflections'
import computeDistanceMatrix from 'server/graphql/mutations/helpers/autoGroup/computeDistanceMatrix'
import getGroupMatrix from 'server/graphql/mutations/helpers/autoGroup/getGroupMatrix'
import getTitleFromComputedGroup from 'server/graphql/mutations/helpers/autoGroup/getTitleFromComputedGroup'
import sortGroupedReflections from 'server/graphql/mutations/helpers/autoGroup/sortGroupedReflections'

/*
 * Read each reflection, parse the content for entities (i.e. nouns), group the reflections based on common themes
 */
const groupReflections = async (meetingId, groupingThreshold) => {
  const now = new Date()
  // get reflections
  const r = getRethink()
  const reflections = await r
    .table('RetroReflection')
    .getAll(meetingId, {index: 'meetingId'})
    .filter({isActive: true})

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
  const newGroups = groupedArrays.map((group, sortOrder) => {
    const reflectionGroupId = shortid.generate()
    // look up the reflection by its vector
    const groupedReflections = group.map((reflectionDistanceArr) => {
      const idx = distanceMatrix.indexOf(reflectionDistanceArr)
      return reflections[idx]
    })
    const groupedReflectionEntities = groupedReflections
      .map(({entities}) => entities)
      .filter(Boolean)
    const smartTitle = getTitleFromComputedGroup(uniqueLemmaArr, group, groupedReflectionEntities)

    // put all the reflections in the column where most of them are
    const getField = ({retroPhaseItemId}) => retroPhaseItemId
    const retroPhaseItemIdMode = mode(groupedReflections, getField)
    const updatedReflectionsForGroup = sortGroupedReflections(
      groupedReflections,
      retroPhaseItemIdMode,
      reflectionGroupId
    )
    updatedReflections.push(...updatedReflectionsForGroup)
    return {
      id: reflectionGroupId,
      createdAt: now,
      isActive: true,
      meetingId,
      smartTitle,
      sortOrder,
      title: smartTitle,
      updatedAt: now,
      voterIds: [],
      retroPhaseItemId: retroPhaseItemIdMode
    }
  })
  return {
    autoGroupThreshold: thresh,
    groups: newGroups,
    groupedReflections: updatedReflections,
    inactivatedGroupIds: oldReflectionGroupIds,
    nextThresh
  }
}

export default groupReflections
