import useAtmosphere from '~/hooks/useAtmosphere'
import {commitLocalUpdate} from 'react-relay'
import {SpotlightGroupsQueryResponse} from './../__generated__/SpotlightGroupsQuery.graphql'
import {RefObject, useEffect, useState} from 'react'
import {ElementWidth} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'
import {MAX_SPOTLIGHT_COLUMNS} from '~/utils/constants'

type Groups = SpotlightGroupsQueryResponse['viewer']['similarReflectionGroups']

const useGroupMatrix = (refGroups: Groups, resultsRef: RefObject<HTMLDivElement>) => {
  const [groupMatrix, setGroupMatrix] = useState<Groups[]>()
  const atmosphere = useAtmosphere()
  const groupsCount = refGroups.length

  const getColumnsCount = () => {
    const {current: el} = resultsRef
    const width = el?.clientWidth
    if (!width) return null
    if (groupsCount <= 2) return 1
    const minColumns = 1
    const minGroupsPerColumn = 2
    const maxColumnsInRef = Math.floor(width / ElementWidth.MEETING_CARD_WITH_MARGIN)
    const maxPossibleColumns = Math.max(
      Math.min(maxColumnsInRef, MAX_SPOTLIGHT_COLUMNS),
      minColumns
    )
    const groupsInSmallestColumn = Math.floor(groupsCount / maxPossibleColumns)
    // if there's just 1/2 groups in a column, reduce the no. of columns
    return groupsInSmallestColumn < minGroupsPerColumn && maxPossibleColumns !== minColumns
      ? maxPossibleColumns - 1
      : maxPossibleColumns
  }

  const createMatrix = () => {
    if (groupMatrix?.length) return
    commitLocalUpdate(atmosphere, (store) => {
      const columnCount = getColumnsCount()
      if (!columnCount) return
      const matrix = [] as Groups[]
      refGroups.forEach((group, idx) => {
        const reflectionGroup = store.get(group.id)
        if (!reflectionGroup) return
        const columnIdx = idx % columnCount
        // set columnIdx so newly added groups can calc the emptiest column
        reflectionGroup?.setValue(columnIdx, 'spotlightColumnIdx')
        const columnGroups = matrix[columnIdx]
        if (columnGroups) {
          matrix.splice(columnIdx, 1, [...columnGroups, group])
        } else {
          matrix.splice(columnIdx, 0, [group])
        }
      })
      setGroupMatrix(matrix)
    })
  }

  const updateMatrix = () => {
    if (!groupMatrix?.length) return
    const matrixGroupsIds = groupMatrix.flatMap((row) => row.map(({id}) => id))
    const newGroup = refGroups.find((group) => !matrixGroupsIds.includes(group.id))
    const refGroupsIds = refGroups.map(({id}) => id)
    const removedGroupId = matrixGroupsIds.find((id) => !refGroupsIds.includes(id))
    if (newGroup && removedGroupId) {
      // Spotlight group was added to a kanban group. remove old Spotlight group and add
      // kanban group in place
      const newMatrix = groupMatrix.map((row) =>
        row.map((group) => (group.id === removedGroupId ? newGroup : group))
      )
      setGroupMatrix(newMatrix)
    } else if (newGroup) {
      // ungrouping added a new group
      const newMatrix = groupMatrix.map((row, idx) =>
        idx === newGroup?.spotlightColumnIdx ? [...row, newGroup] : row
      )
      setGroupMatrix(newMatrix)
    } else if (removedGroupId) {
      // group added to another Spotlight group. remove the old group
      const newMatrix = groupMatrix.map((row) => row.filter((group) => group.id !== removedGroupId))
      setGroupMatrix(newMatrix)
    }
  }

  useEffect(() => {
    if (!groupMatrix?.length) createMatrix()
    else updateMatrix()
  }, [resultsRef.current, refGroups])

  useResizeObserver(createMatrix, resultsRef)

  return groupMatrix
}

export default useGroupMatrix
