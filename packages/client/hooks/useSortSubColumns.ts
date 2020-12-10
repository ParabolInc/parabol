import {useLayoutEffect} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {SubColumn} from '~/types/constEnums'
import useAtmosphere from './useAtmosphere'

const useSortSubColumns = (isWidthExpanded: boolean, reflectionGroups) => {
  const atmosphere = useAtmosphere()
  useLayoutEffect(() => {
    if (!isWidthExpanded) return
    commitLocalUpdate(atmosphere, (store) => {
      if (!reflectionGroups) return
      reflectionGroups.forEach((group, index) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const subColumn = index % 2 === 0 ? SubColumn.LEFT : SubColumn.RIGHT
        reflectionGroup.setValue(subColumn, 'subColumn')
      })
    })
  }, [isWidthExpanded])
}

export default useSortSubColumns
