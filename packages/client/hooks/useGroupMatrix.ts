import {SpotlightGroupsQueryResponse} from './../__generated__/SpotlightGroupsQuery.graphql'
import {RefObject, useEffect, useState} from 'react'
import {ElementWidth} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'
import {MAX_SPOTLIGHT_COLUMNS} from '~/utils/constants'
import useInitialRender from './useInitialRender'

type Group = SpotlightGroupsQueryResponse['viewer']['similarReflectionGroups'][0]

const useGroupMatrix = (
  resultsGroups: readonly Group[],
  resultsRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>
) => {
  const isInit = useInitialRender()

  const getColumnsCount = () => {
    const {current: el} = resultsRef
    const width = el?.clientWidth
    if (!width) return null
    let colCount = 1
    const currentMaxColumns = Math.min(resultsGroups.length, MAX_SPOTLIGHT_COLUMNS)
    const getNextWidth = (count: number) =>
      ElementWidth.MEETING_CARD * count + ElementWidth.MEETING_CARD_MARGIN * (count - 1)
    while (getNextWidth(colCount + 1) < width && colCount + 1 <= currentMaxColumns) {
      colCount++
    }
    return colCount
  }

  const initMatrix = (): Group[][] => {
    const columnsCount = getColumnsCount()
    if (columnsCount === null) return []
    const matrix = Array.from(new Array(columnsCount), () => []) as Group[][]
    resultsGroups.forEach((group, idx) => {
      const columnIdx = idx % columnsCount
      matrix[columnIdx].push(group)
    })
    return matrix
  }

  const [groupMatrix, setGroupMatrix] = useState(initMatrix)

  const getEmptiestColumnIdx = () => {
    const columnsCount = getColumnsCount()
    // Use initColumns to get emptiest column vs emptiest column with a group in it.
    // For example, column 1 & column 2 both contain 1 group, group in column 2 is
    // grouped into column 1, column with min len in groupMatrix is column 1.
    const initColumns = Array.from([...Array(columnsCount).keys()].fill(0))
    const counts: number[] = groupMatrix.reduce((arr: number[], row, idx) => {
      arr[idx] = row.length
      return arr
    }, initColumns)
    const minVal = Math.min(...counts)
    return counts.indexOf(minVal)
  }

  const updateMatrix = () => {
    const matrixGroupsIds = groupMatrix.flatMap((row) => row.map(({id}) => id))
    const newGroup = resultsGroups.find((group) => !matrixGroupsIds.includes(group.id))
    const refGroupsIds = resultsGroups.map(({id}) => id)
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
        emptiestColumnIdx > matrixColumns // add to empty column
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
    if (isInit) return
    updateMatrix()
  }, [resultsGroups])

  const createMatrix = () => setGroupMatrix(initMatrix())
  useResizeObserver(createMatrix, phaseRef)

  return groupMatrix
}

export default useGroupMatrix
