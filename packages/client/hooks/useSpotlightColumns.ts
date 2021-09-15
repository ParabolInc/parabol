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
      const maxColumns = Math.floor(width / ElementWidth.MEETING_CARD_WITH_MARGIN)
      const columnsCount = Math.max(Math.min(maxColumns, 3), 1)
      const newColumns = [...Array(columnsCount).keys()]
      setColumns(newColumns)
    }
  }

  useLayoutEffect(getColumns, [groupsRef])
  useResizeObserver(getColumns, groupsRef)
  return columns
}

export default useSpotlightColumns
