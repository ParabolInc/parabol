import useAtmosphere from '~/hooks/useAtmosphere'
import {commitLocalUpdate} from 'react-relay'
import {useLayoutEffect} from 'react'

const useGroupsByColumn = (similarReflectionGroups, columns: null | number[]) => {
  const atmosphere = useAtmosphere()

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
    const spotlightIdxsExist = similarReflectionGroups.find((group) => group.spotlightColumnIdx)
    if (!columns || spotlightIdxsExist) return
    initGroups()
  }, [columns])
}

export default useGroupsByColumn
