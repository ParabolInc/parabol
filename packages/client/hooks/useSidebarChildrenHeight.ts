import {RefObject, useLayoutEffect, useState} from 'react'
import {NavSidebar} from '../types/constEnums'
import useResizeObserver from './useResizeObserver'

const useSidebarChildrenHeight = (navListRef: RefObject<HTMLUListElement>) => {
  const [maxSidebarChildrenHeight, setMaxSidebarChildrenHeight] = useState<null | number>(null)

  const getMaxHeight = () => {
    const el = navListRef.current
    if (!el) return
    const {clientHeight} = el
    const newMaxHeight = clientHeight - NavSidebar.ITEM_HEIGHT * 3
    setMaxSidebarChildrenHeight(newMaxHeight)
  }
  useLayoutEffect(getMaxHeight, [])
  useResizeObserver(getMaxHeight, navListRef)
  return maxSidebarChildrenHeight
}

export default useSidebarChildrenHeight
