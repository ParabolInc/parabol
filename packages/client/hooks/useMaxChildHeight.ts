import {RefObject, useLayoutEffect, useState} from 'react'
import {NavSidebar} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const useMaxChildHeight = (navPhasesRef: RefObject<HTMLDivElement>, agendaItemsCount: number) => {
  const [height, setHeight] = useState<null | number>(null)

  const getMaxChildHeight = () => {
    const el = navPhasesRef.current
    if (!el) return
    const {clientHeight} = el
    const emptyBlockHeight = agendaItemsCount === 0 ? NavSidebar.EMPTY_BLOCK_HEIGHT : 0
    const maxChildHeight = Math.max(
      clientHeight -
        (NavSidebar.ITEM_HEIGHT * 3 + NavSidebar.AGENDA_ITEM_INPUT_HEIGHT + emptyBlockHeight),
      0
    )
    setHeight(maxChildHeight)
  }
  useLayoutEffect(() => getMaxChildHeight(), [navPhasesRef.current])
  useResizeObserver(getMaxChildHeight, navPhasesRef)

  return height
}

export default useMaxChildHeight
