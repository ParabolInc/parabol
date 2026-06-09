import {useCallback, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {cosineSimilarity} from '../utils/cosineSimilarity'
import useAtmosphere from './useAtmosphere'

type ReflectionGroup = {
  readonly id: string
  reflections: readonly {
    readonly id: string
    readonly embeddingVector?: ReadonlyArray<number> | null
  }[]
}

const SIMILARITY_THRESHOLD = 0.75
const MAX_SIMILAR_GROUPS = 2

const useHoverReflectionSimilarity = (
  reflectionGroups: readonly ReflectionGroup[],
  isGroupPhase: boolean
) => {
  const atmosphere = useAtmosphere()
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (reflectionId: string | null) => {
      const clearAll = () => {
        commitLocalUpdate(atmosphere, (store) => {
          for (const group of reflectionGroups) {
            store.get(group.id)?.setValue(null, 'activeReflectionGroupSimilarity')
          }
        })
      }

      if (!reflectionId || !isGroupPhase) {
        clearTimerRef.current = setTimeout(clearAll, 0)
        return
      }
      if (clearTimerRef.current) {
        clearTimeout(clearTimerRef.current)
        clearTimerRef.current = null
      }

      const sourceGroup = reflectionGroups.find((group) =>
        group.reflections.some((r) => r.id === reflectionId)
      )
      const sourceReflection = sourceGroup?.reflections.find((r) => r.id === reflectionId)
      const sourceVec = sourceReflection?.embeddingVector
      const sourceGroupId = sourceGroup?.id

      if (!sourceVec || sourceVec.length === 0) {
        clearAll()
        return
      }

      const sourceArr = sourceVec as number[]

      // Compute group-level similarities using centroid for multi-reflection groups
      const groupScores: {groupId: string; score: number}[] = []
      for (const group of reflectionGroups) {
        if (group.id === sourceGroupId) continue

        const vecs = group.reflections
          .map((r) => r.embeddingVector)
          .filter((v): v is ReadonlyArray<number> => Array.isArray(v) && v.length > 0)

        if (vecs.length === 0) continue

        let groupVec: number[]
        if (vecs.length === 1) {
          groupVec = vecs[0] as number[]
        } else {
          // Average all vectors then renormalize to unit length
          const dim = vecs[0]!.length
          const centroid = new Array<number>(dim).fill(0)
          for (const v of vecs) {
            for (let i = 0; i < dim; i++) centroid[i] = (centroid[i] ?? 0) + (v[i] ?? 0)
          }
          const mag = Math.sqrt(centroid.reduce((sum, x) => sum + x * x, 0))
          groupVec = mag > 0 ? centroid.map((x) => x / mag) : centroid
        }

        groupScores.push({groupId: group.id, score: cosineSimilarity(sourceArr, groupVec)})
      }

      groupScores.sort((a, b) => b.score - a.score)
      const selected = groupScores
        .filter((g) => g.score >= SIMILARITY_THRESHOLD)
        .slice(0, MAX_SIMILAR_GROUPS)

      commitLocalUpdate(atmosphere, (store) => {
        for (const group of reflectionGroups) {
          store.get(group.id)?.setValue(null, 'activeReflectionGroupSimilarity')
        }
        if (selected.length > 0) {
          // -1 sentinel marks the hovered source group (shows ring, no badge)
          store.get(sourceGroupId!)?.setValue(-1, 'activeReflectionGroupSimilarity')
          for (const {groupId} of selected) {
            store.get(groupId)?.setValue(1, 'activeReflectionGroupSimilarity')
          }
        }
      })
    },
    [reflectionGroups, atmosphere, isGroupPhase]
  )
}

export default useHoverReflectionSimilarity
