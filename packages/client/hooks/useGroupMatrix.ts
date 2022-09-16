import {RefObject, useEffect, useState} from 'react'
import {MAX_SPOTLIGHT_COLUMNS} from '~/utils/constants'
import {ElementWidth} from '../types/constEnums'
import {SpotlightResultsQueryResponse} from './../__generated__/SpotlightResultsQuery.graphql'
import useInitialRender from './useInitialRender'
import useResizeObserver from './useResizeObserver'

type Group = SpotlightResultsQueryResponse['viewer']['similarReflectionGroups'][0]

const useGroupMatrix = (
  resultsGroups: readonly Group[],
  resultsRef: RefObject<HTMLDivElement>,
  phaseRef: RefObject<HTMLDivElement>
) => {
  const isInit = useInitialRender()
  const [groupMatrix, setGroupMatrix] = useState<Group[][]>([])

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

  const initMatrix = () => {
    const columnsCount = getColumnsCount()
    if (columnsCount === null) return
    const matrix = Array.from(new Array(columnsCount), () => []) as Group[][]
    resultsGroups.forEach((group, idx) => {
      const columnIdx = idx % columnsCount
      matrix[columnIdx]!.push(group)
    })
    setGroupMatrix(matrix)
  }

  const getEmptiestColumnIdx = (groupMatrix) => {
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
    const newGroups = resultsGroups.filter(({id}) => !matrixGroupsIds.includes(id))
    const resultsGroupsIds = resultsGroups.map(({id}) => id)
    const removedGroupsIds = matrixGroupsIds.filter((id) => !resultsGroupsIds.includes(id))
    if (!removedGroupsIds.length && !newGroups.length) return
    // grouping results or updating the search query can remove groups
    const filteredMatrix = groupMatrix
      .map((row) => row.filter(({id}) => !removedGroupsIds.includes(id)))
      .filter(({length}) => length) // remove column if empty
    if (!newGroups.length) {
      setGroupMatrix(filteredMatrix)
    } else if (newGroups.length) {
      // ungrouping results or updating the search query can add new groups
      const newMatrix = newGroups.reduce((matrix, newGroup) => {
        const emptiestColumnIdx = getEmptiestColumnIdx(matrix)
        const matrixColumns = matrix.length - 1
        return emptiestColumnIdx > matrixColumns
          ? [...matrix, [newGroup]] // add to empty column
          : matrix.map((row, idx) => (idx === emptiestColumnIdx ? [...row, newGroup] : row))
      }, filteredMatrix)
      setGroupMatrix(newMatrix)
    }
  }

  useEffect(() => {
    if (isInit) {
      initMatrix()
      return
    }
    updateMatrix()
  }, [resultsGroups])

  useResizeObserver(initMatrix, phaseRef)

  return groupMatrix
}

export default useGroupMatrix
