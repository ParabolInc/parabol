import {computeJaccardDistanceMatrix} from './computeJaccardDistanceMatrix'
import getGroupMatrix from './getGroupMatrix'

export type GroupingOptions = {
  groupingThreshold: number
  maxGroupSize?: number
  maxReductionPercent?: number
}

const groupReflections = <
  T extends {id: string; reflectionGroupId: string; plaintextContent: string}
>(
  reflections: T[],
  groupingOptions: GroupingOptions
) => {
  const reflectionTexts = reflections.map((r) => r.plaintextContent || '')
  const distanceMatrix = computeJaccardDistanceMatrix(reflectionTexts)

  const {
    groups: groupedArrays,
    thresh,
    nextThresh
  } = getGroupMatrix(distanceMatrix, groupingOptions)

  const updatedReflections: Array<{
    reflectionId: string
    oldReflectionGroupId: string
    sortOrder: number
    reflectionGroupId: string
  }> = []

  const reflectionGroupMapping: Record<string, string> = {}
  const oldReflectionGroupIds = reflections.map((r) => r.reflectionGroupId)

  const updatedGroups = groupedArrays.map((group) => {
    let reflectionGroupId = ''

    const groupedReflectionsRes = group.map((reflectionDistanceArr, sortOrder) => {
      const idx = distanceMatrix.indexOf(reflectionDistanceArr)
      const reflection = reflections[idx]!
      reflectionGroupId = reflectionGroupId || reflection.reflectionGroupId
      return {
        reflectionId: reflection.id,
        oldReflectionGroupId: reflection.reflectionGroupId,
        sortOrder,
        reflectionGroupId
      }
    })

    updatedReflections.push(...groupedReflectionsRes)
    groupedReflectionsRes.forEach(({oldReflectionGroupId}) => {
      reflectionGroupMapping[oldReflectionGroupId] = reflectionGroupId
    })

    return {
      id: reflectionGroupId
    }
  })

  const newReflectionGroupIds = new Set(
    updatedReflections.map(({reflectionGroupId}) => reflectionGroupId)
  )
  const removedReflectionGroupIds = oldReflectionGroupIds.filter(
    (oldId) => !newReflectionGroupIds.has(oldId)
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
