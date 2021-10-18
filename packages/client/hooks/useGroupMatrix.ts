import {SpotlightGroupsQueryResponse} from './../__generated__/SpotlightGroupsQuery.graphql'
import {RefObject, useEffect, useState} from 'react'
import {ElementWidth} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'
import {MAX_SPOTLIGHT_COLUMNS} from '~/utils/constants'

type Groups = SpotlightGroupsQueryResponse['viewer']['similarReflectionGroups']

const useGroupMatrix = (
  refGroups: Groups,
  resultsRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>
) => {
  const [groupMatrix, setGroupMatrix] = useState<Groups[]>()
  const [prevColumnsCount, setPrevColumnsCount] = useState<null | number>(null)

  const getColumnsCount = () => {
    const {current: el} = resultsRef
    const width = el?.clientWidth
    if (!width) return null
    const groupsCount = refGroups.length
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

  const getEmptiestColumnIdx = () => {
    // columnsCount differs from groupMatrix columns if all groups in column 0 are grouped into column 1
    const columnsCount = getColumnsCount()
    // TypeScript bug thinks column is an unused value. Use _column temporarily
    const initColumns = Array.from([...Array(columnsCount).keys()], (_column) => (_column = 0))
    const counts: number[] = groupMatrix!.reduce((arr: number[], row, idx) => {
      arr[idx] = row.length
      return arr
    }, initColumns)
    const minVal = Math.min(...counts)
    return counts.indexOf(minVal)
  }

  const createMatrix = () => {
    const columnsCount = getColumnsCount()
    if (!columnsCount || columnsCount === prevColumnsCount) return
    setPrevColumnsCount(columnsCount)
    const matrix = [] as Groups[]
    refGroups.forEach((group, idx) => {
      const columnIdx = idx % columnsCount
      const columnGroups = matrix[columnIdx]
      if (columnGroups) matrix.splice(columnIdx, 1, [...columnGroups, group])
      else matrix.splice(columnIdx, 0, [group])
    })
    setGroupMatrix(matrix)
  }

  const updateMatrix = () => {
    if (!groupMatrix?.length) return
    const matrixGroupsIds = groupMatrix.flatMap((row) => row.map(({id}) => id))
    const newGroup = refGroups.find((group) => !matrixGroupsIds.includes(group.id))
    const refGroupsIds = refGroups.map(({id}) => id)
    const removedGroupId = matrixGroupsIds.find((id) => !refGroupsIds.includes(id))
    if (newGroup && removedGroupId) {
      // added to kanban group. Remove old Spotlight group and add kanban group in place
      const newMatrix = groupMatrix.map((row) =>
        row.map((group) => (group.id === removedGroupId ? newGroup : group))
      )
      setGroupMatrix(newMatrix)
    } else if (newGroup) {
      // ungrouping added a new group
      const emptiestColumnIdx = getEmptiestColumnIdx()
      const matrixColumns = groupMatrix.length - 1
      const newMatrix =
        emptiestColumnIdx > matrixColumns
          ? [...groupMatrix, [newGroup]]
          : groupMatrix.map((row, idx) => (idx === emptiestColumnIdx ? [...row, newGroup] : row))
      setGroupMatrix(newMatrix)
    } else if (removedGroupId) {
      // group added to another Spotlight group. Remove the old group & remove column if empty
      const newMatrix = groupMatrix
        .map((row) => row.filter((group) => group.id !== removedGroupId))
        .filter(({length}) => length)
      setGroupMatrix(newMatrix)
    }
  }

  useEffect(() => {
    if (!groupMatrix?.length) createMatrix()
    else updateMatrix()
  }, [resultsRef.current, refGroups])

  useResizeObserver(createMatrix, phaseRef)

  return groupMatrix
}

export default useGroupMatrix
