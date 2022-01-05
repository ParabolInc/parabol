import computeDistanceMatrix from './computeDistanceMatrix'
import getAllLemmasFromReflections from './getAllLemmasFromReflections'
import getGroupMatrix from './getGroupMatrix'
import getTitleFromComputedGroup from './getTitleFromComputedGroup'
import Reflection from '~/../server/database/types/Reflection'
import GoogleAnalyzedEntity from '../../../server/database/types/GoogleAnalyzedEntity'

/*
 * Read each reflection, parse the content for entities (i.e. nouns), group the reflections based on common themes
 */

type GroupedReflectionRes = {
  reflectionId: string
  entities: GoogleAnalyzedEntity[]
  oldReflectionGroupId: string
  sortOrder: number
  reflectionGroupId: string
}

export type GroupingOptions = {
  groupingThreshold: number
  maxGroupSize?: number
  maxReductionPercent?: number
}

const groupReflections = <T extends Reflection>(
  reflections: T[],
  groupingOptions: GroupingOptions
) => {
  const allReflectionEntities = reflections.map(({entities}) => entities!)
  const oldReflectionGroupIds = reflections.map(({reflectionGroupId}) => reflectionGroupId)

  // create a unique array of all entity names mentioned in the meeting's reflect phase
  const uniqueLemmaArr = getAllLemmasFromReflections(allReflectionEntities)
  // create a distance vector for each reflection
  const distanceMatrix = computeDistanceMatrix(allReflectionEntities, uniqueLemmaArr)
  const {
    groups: groupedArrays,
    thresh,
    nextThresh
  } = getGroupMatrix(distanceMatrix, groupingOptions)
  // replace the arrays with reflections
  const updatedReflections = [] as GroupedReflectionRes[]
  const reflectionGroupMapping = {} as Record<string, string>
  const updatedGroups = (groupedArrays as any[]).map((group) => {
    // look up the reflection by its vector, put them all in the same group
    let reflectionGroupId = ''
    const groupedReflectionsRes: GroupedReflectionRes[] = (group as any[]).map(
      (reflectionDistanceArr, sortOrder) => {
        const idx = distanceMatrix.indexOf(reflectionDistanceArr)
        const reflection = reflections[idx]
        reflectionGroupId = reflectionGroupId || reflection.reflectionGroupId
        return {
          reflectionId: reflection.id,
          entities: reflection.entities,
          oldReflectionGroupId: reflection.reflectionGroupId,
          sortOrder,
          reflectionGroupId
        }
      }
    )

    const groupedReflectionEntities = groupedReflectionsRes
      .map(({entities}) => entities)
      .filter(Boolean)
    const smartTitle = getTitleFromComputedGroup(
      uniqueLemmaArr,
      group,
      groupedReflectionEntities,
      reflections
    )

    updatedReflections.push(...groupedReflectionsRes)

    groupedReflectionsRes.forEach((groupedReflection) => {
      reflectionGroupMapping[groupedReflection.oldReflectionGroupId] = reflectionGroupId
    })

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
    groupedReflectionsRes: updatedReflections,
    reflectionGroupMapping,
    removedReflectionGroupIds,
    nextThresh
  }
}

export default groupReflections
