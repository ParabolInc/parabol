import {SpotlightGroupsQueryResponse} from './../__generated__/SpotlightGroupsQuery.graphql'
import {RefObject, useEffect, useLayoutEffect, useRef, useState} from 'react'
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
    const getNextWidth = (count: number) =>
      ElementWidth.MEETING_CARD * count + ElementWidth.MEETING_CARD_MARGIN * (count - 1)
    while (getNextWidth(colCount + 1) < width && colCount + 1 <= MAX_SPOTLIGHT_COLUMNS) {
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

  // const [groupMatrix, setGroupMatrix] = useState(initMatrix)
  const initialMatrix = initMatrix()
  const groupMatrix = useRef<Group[][]>(initialMatrix)
  // const groupMatrixRef = useRef(initMatrix)

  const getEmptiestColumnIdx = () => {
    const counts = groupMatrix.current.map((row) => row.length)
    const minVal = Math.min(...counts)
    return counts.indexOf(minVal)
  }

  const updateMatrix = () => {
    const matrixGroupsIds = groupMatrix.current.flatMap((row) => row.map(({id}) => id))
    const newGroup = resultsGroups.find((group) => !matrixGroupsIds.includes(group.id))
    const refGroupsIds = resultsGroups.map(({id}) => id)
    const removedGroupId = matrixGroupsIds.find((id) => !refGroupsIds.includes(id))
    if (newGroup && removedGroupId) {
      // added to kanban group. Remove old Spotlight group and add kanban group in place
      const newMatrix = groupMatrix.current.map((row) =>
        row.map((group) => (group.id === removedGroupId ? newGroup : group))
      )
      groupMatrix.current = newMatrix
      // setGroupMatrix(newMatrix)
    } else if (newGroup) {
      // ungrouping added a new group
      const emptiestColumnIdx = getEmptiestColumnIdx()
      const matrixColumns = groupMatrix.current.length - 1
      const newMatrix =
        emptiestColumnIdx > matrixColumns
          ? [...groupMatrix.current, [newGroup]]
          : groupMatrix.current.map((row, idx) =>
              idx === emptiestColumnIdx ? [...row, newGroup] : row
            )
      // setGroupMatrix(newMatrix)
      groupMatrix.current = newMatrix
    } else if (removedGroupId) {
      // group added to another Spotlight group. Remove the old group & remove column if empty
      const newMatrix = groupMatrix.current
        .map((row) => row.filter((group) => group.id !== removedGroupId))
        .filter(({length}) => length)
      // setGroupMatrix(newMatrix)
      groupMatrix.current = newMatrix
    }
  }

  // useEffect(() => {
  useLayoutEffect(() => {
    if (isInit) return
    updateMatrix()
  }, [resultsGroups])

  const createMatrix = () => {
    // setGroupMatrix(initMatrix())
    const newMatrix = initMatrix()
    groupMatrix.current = newMatrix
  }
  useResizeObserver(createMatrix, phaseRef)

  return groupMatrix.current
}

export default useGroupMatrix
