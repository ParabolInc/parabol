import useAtmosphere from '~/hooks/useAtmosphere'
import {commitLocalUpdate} from 'react-relay'
import {useLayoutEffect} from 'react'

const useGroupsByColumn = (similarReflectionGroups, columns: null | number[]) => {
  const atmosphere = useAtmosphere()

  // const unassignedGroups = similarReflectionGroups.filter(
  //   (group) => group.spotlightColumnIdx === undefined
  // )

  const initGroups = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const columnCount = columns?.length || 0
      similarReflectionGroups.forEach((group, idx) => {
        const reflectionGroup = store.get(group.id)
        const groupIdx = idx % columnCount
        reflectionGroup?.setValue(groupIdx, 'spotlightColumnIdx')
      })
    })
  }

  useLayoutEffect(() => {
    if (!columns?.length) return
    initGroups()
  }, [columns?.length])
}

export default useGroupsByColumn
