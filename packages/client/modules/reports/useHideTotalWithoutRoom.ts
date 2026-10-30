import {type RefObject, useLayoutEffect} from 'react'
import useEventCallback from '../../hooks/useEventCallback'
import useResizeObserver from '../../hooks/useResizeObserver'

// Hides a heatmap's total column when the table can't fit it without scrolling sideways. The table is measured at
// its narrowest with the column shown, before paint, so hiding it can't make it fit and show it again
const useHideTotalWithoutRoom = (scrollRef: RefObject<HTMLDivElement>, isEnabled: boolean) => {
  const fit = useEventCallback(() => {
    const scroller = scrollRef.current
    const table = scroller?.querySelector('table')
    if (!scroller || !table) return
    delete table.dataset.hideTotal
    if (!isEnabled) return
    const {width} = table.style
    table.style.width = 'min-content'
    const minWidth = table.offsetWidth
    table.style.width = width
    if (minWidth > scroller.clientWidth) table.dataset.hideTotal = ''
  })
  useLayoutEffect(fit)
  useResizeObserver(fit, scrollRef)
}

export default useHideTotalWithoutRoom
