import {RefObject, useLayoutEffect, useState} from 'react'
import {ElementWidth} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const useSpotlightColumns = (groupsRef: RefObject<HTMLDivElement>) => {
  const [columns, setColumns] = useState<null | number[]>(null)

  const getcolumns = () => {
    const {current: el} = groupsRef
    const width = el?.clientWidth
    if (!width) return
    const columnsCount = Math.max(Math.floor(width / ElementWidth.MEETING_CARD_WITH_MARGIN), 1)
    const newColumns = [...Array(columnsCount).keys()]
    setColumns(newColumns)
  }

  useLayoutEffect(getcolumns, [groupsRef])
  useResizeObserver(getcolumns, groupsRef)
  return columns
}

export default useSpotlightColumns
