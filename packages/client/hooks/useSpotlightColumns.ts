import {RefObject, useLayoutEffect, useState} from 'react'
import {ElementWidth} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const useSpotlightColumns = (groupsRef: RefObject<HTMLDivElement>, groupsCount: number) => {
  const [columns, setColumns] = useState<null | number[]>(null)

  const getColumns = () => {
    const {current: el} = groupsRef
    const width = el?.clientWidth
    if (!width) return
    if (groupsCount <= 2) {
      setColumns([0])
    } else {
      const maxColumnsLargeScreen = 3
      const minColumns = 1
      const minGroupsPerColumn = 2
      const maxColumnsInRef = Math.floor(width / ElementWidth.MEETING_CARD_WITH_MARGIN)
      const maxColumns = Math.max(Math.min(maxColumnsInRef, maxColumnsLargeScreen), minColumns)
      let columnsCount = maxColumns
      let groupsPerColumn = Math.ceil(groupsCount / columnsCount)
      while (groupsPerColumn <= minGroupsPerColumn && columnsCount !== minColumns) {
        columnsCount = columnsCount - 1
        groupsPerColumn = Math.ceil(groupsCount / columnsCount)
      }
      const newColumns = [...Array(columnsCount).keys()]
      setColumns(newColumns)
    }
  }

  useLayoutEffect(getColumns, [groupsRef, groupsCount])
  useResizeObserver(getColumns, groupsRef)
  return columns
}

export default useSpotlightColumns
