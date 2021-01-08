import {useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from './useAtmosphere'

interface SubColumnIdxs {
  [key: string]: number
}

const useSortNewReflectionGroup = (
  isWidthExpanded: boolean,
  subColumnCount: number,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
) => {
  const atmosphere = useAtmosphere()

  const handleNewReflectionGroup = () => {
    if (!isWidthExpanded || !reflectionGroups) return
    const subColumnIdxCounts = {} as SubColumnIdxs
    const subColumnIndexes = [...Array(subColumnCount).keys()]
    subColumnIndexes.forEach((idx) => (subColumnIdxCounts[idx] = 0))

    commitLocalUpdate(atmosphere, (store) => {
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
  useEffect(() => handleNewReflectionGroup(), [reflectionGroups])
}

export default useSortNewReflectionGroup
