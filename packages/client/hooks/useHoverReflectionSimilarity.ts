import {useCallback, useRef, useState} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {cosineSimilarity} from '../utils/cosineSimilarity'
import useAtmosphere from './useAtmosphere'
import useHotkey from './useHotkey'

type ReflectionGroup = {
  readonly id: string
  readonly promptId: string
  reflections: readonly {
    readonly id: string
    readonly embeddingVector?: ReadonlyArray<number> | null
  }[]
}
const SAME_COLUMN_BONUS = 0.03
const SIMILARITY_THRESHOLD = 0.78 + SAME_COLUMN_BONUS
const MAX_SIMILAR_GROUPS = 2
const MARGINAL_CARD_PENALTY = 0.05

const useHoverReflectionSimilarity = (
  reflectionGroups: readonly ReflectionGroup[],
  isGroupPhase: boolean
) => {
  const atmosphere = useAtmosphere()
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showVectorDebug, setShowVectorDebug] = useState(false)
  useHotkey('v e c t o r s', () => setShowVectorDebug((v) => !v))

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
      const sourceGroupId = sourceGroup?.id

      if (!sourceGroup) {
        clearAll()
        return
      }

      const sourceVecs = sourceGroup.reflections
        .map((r) => r.embeddingVector)
        .filter((v): v is ReadonlyArray<number> => Array.isArray(v) && v.length > 0)

      if (sourceVecs.length === 0) {
        clearAll()
        return
      }

      let sourceArr: number[]
      if (sourceVecs.length === 1) {
        sourceArr = sourceVecs[0] as number[]
      } else {
        const dim = sourceVecs[0]!.length
        const centroid = new Array<number>(dim).fill(0)
        for (const v of sourceVecs) {
          for (let i = 0; i < dim; i++) centroid[i] = (centroid[i] ?? 0) + (v[i] ?? 0)
        }
        const mag = Math.sqrt(centroid.reduce((sum, x) => sum + x * x, 0))
        sourceArr = mag > 0 ? centroid.map((x) => x / mag) : centroid
      }

      // Compute group-level similarities using centroid for multi-reflection groups
      const sourceSize = sourceGroup.reflections.length
      const groupScores: {groupId: string; score: number; targetSize: number}[] = []
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

        const sameColumn = group.promptId === sourceGroup.promptId ? SAME_COLUMN_BONUS : 0
        groupScores.push({
          groupId: group.id,
          score: cosineSimilarity(sourceArr, groupVec) + sameColumn,
          targetSize: group.reflections.length
        })
      }

      groupScores.sort((a, b) => b.score - a.score)

      commitLocalUpdate(atmosphere, (store) => {
        for (const group of reflectionGroups) {
          store.get(group.id)?.setValue(null, 'activeReflectionGroupSimilarity')
        }
        const selected = new Set(
          groupScores
            .filter((g) => {
              const resultingSize = sourceSize + g.targetSize
              const threshold =
                SIMILARITY_THRESHOLD + Math.max(0, resultingSize - 3) * MARGINAL_CARD_PENALTY
              return g.score >= threshold
            })
            .slice(0, MAX_SIMILAR_GROUPS)
            .map((g) => g.groupId)
        )
        if (showVectorDebug || selected.size > 0) {
          // -1 sentinel marks the hovered source group (shows ring, no badge)
          store.get(sourceGroupId!)?.setValue(-1, 'activeReflectionGroupSimilarity')
        }
        if (showVectorDebug) {
          // Positive score = would be ringed; negative = badge-only in debug view
          for (const {groupId, score} of groupScores) {
            store
              .get(groupId)
              ?.setValue(selected.has(groupId) ? score : -score, 'activeReflectionGroupSimilarity')
          }
        } else {
          for (const groupId of selected) {
            store.get(groupId)?.setValue(1, 'activeReflectionGroupSimilarity')
          }
        }
      })
    },
    [reflectionGroups, atmosphere, isGroupPhase, showVectorDebug]
  )
}

export default useHoverReflectionSimilarity
