import {useLayoutEffect, useEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {SubColumn} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'
import useDeepEqual from './useDeepEqual'

const useSortSubColumns = (isWidthExpanded: boolean, reflectionGroups) => {
  const atmosphere = useAtmosphere()
  const groups = useDeepEqual(reflectionGroups)

  useLayoutEffect(() => {
    if (!groups) return
    commitLocalUpdate(atmosphere, (store) => {
      groups.forEach((group, index) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const subColumn = index % 2 === 0 ? SubColumn.LEFT : SubColumn.RIGHT
        reflectionGroup.setValue(subColumn, 'subColumn')
      })
    })
  }, [isWidthExpanded])

  const updateReflectionGroups = () => {
    if (!isWidthExpanded || !groups) return
    commitLocalUpdate(atmosphere, (store) => {
      let leftSubColumnCount = 0
      let rightSubColumnCount = 0
      groups.forEach((group) => {
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
  useEffect(() => {
    updateReflectionGroups()
  }, [groups])
}

export default useSortSubColumns
