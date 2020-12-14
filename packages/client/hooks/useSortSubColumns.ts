import {useLayoutEffect, useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {SubColumn} from '~/types/constEnums'
import {GroupingKanbanColumn_reflectionGroups} from '~/__generated__/GroupingKanbanColumn_reflectionGroups.graphql'
import useAtmosphere from './useAtmosphere'

const useSortSubColumns = (
  isWidthExpanded: boolean,
  reflectionGroups: GroupingKanbanColumn_reflectionGroups
) => {
  const atmosphere = useAtmosphere()
  useLayoutEffect(() => {
    if (!reflectionGroups) return
    commitLocalUpdate(atmosphere, (store) => {
      reflectionGroups.forEach((group, index) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const subColumn = index % 2 === 0 ? SubColumn.LEFT : SubColumn.RIGHT
        reflectionGroup.setValue(subColumn, 'subColumn')
      })
    })
  }, [isWidthExpanded])

  const updateReflectionGroups = () => {
    if (!isWidthExpanded || !reflectionGroups) return
    commitLocalUpdate(atmosphere, (store) => {
      let leftSubColumnCount = 0
      let rightSubColumnCount = 0
      reflectionGroups.forEach((group) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const currentSubColumn = reflectionGroup.getValue('subColumn')
        if (!currentSubColumn) {
          const subColumn =
            leftSubColumnCount > rightSubColumnCount ? SubColumn.RIGHT : SubColumn.LEFT
          reflectionGroup.setValue(subColumn, 'subColumn')
        } else {
          currentSubColumn === SubColumn.LEFT
            ? (leftSubColumnCount += 1)
            : (rightSubColumnCount += 1)
        }
      })
    })
  }
  useEffect(() => updateReflectionGroups(), [reflectionGroups])
}

export default useSortSubColumns
