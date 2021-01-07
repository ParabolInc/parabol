import {useLayoutEffect, useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from './useAtmosphere'

interface SubColumnIdxs {
  [key: string]: number
}

const useSortSubColumns = (
  isWidthExpanded: boolean,
  maxSubColumnCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
) => {
  const atmosphere = useAtmosphere()
  useLayoutEffect(() => {
    if (!reflectionGroups) return
    commitLocalUpdate(atmosphere, (store) => {
      let nextSubColumnIdx = 0
      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        reflectionGroup.setValue(nextSubColumnIdx, 'subColumnIdx')
        if (nextSubColumnIdx === maxSubColumnCount - 1) nextSubColumnIdx = 0
        else nextSubColumnIdx += 1
      })
    })
  }, [isWidthExpanded])

  const updateReflectionGroups = () => {
    if (!isWidthExpanded || !reflectionGroups) return
    commitLocalUpdate(atmosphere, (store) => {
      const subColumnIdxCounts = {} as SubColumnIdxs
      const subColumnIndexes = [...Array(maxSubColumnCount).keys()]
      subColumnIndexes.forEach((idx) => (subColumnIdxCounts[idx] = 0))

      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const currentSubColumnIdx = reflectionGroup.getValue('subColumnIdx') as number
        if (currentSubColumnIdx === undefined) {
          const smallestSubColumnCount = Math.min(...Object.values(subColumnIdxCounts))
          const smallestSubColumnKey = Object.keys(subColumnIdxCounts).find(
            (key) => subColumnIdxCounts[key] === smallestSubColumnCount
          ) as string
          reflectionGroup.setValue(parseInt(smallestSubColumnKey), 'subColumnIdx')
        } else {
          subColumnIdxCounts[currentSubColumnIdx] += 1
        }
      })
    })
  }
  useEffect(() => updateReflectionGroups(), [reflectionGroups])
}

export default useSortSubColumns
