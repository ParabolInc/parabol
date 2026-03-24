import styled from '@emotion/styled'
import {type ReactNode, useCallback, useEffect, useRef} from 'react'
import ResizeObserverPolyfill from 'resize-observer-polyfill'

interface GridProps {
  colWidth: number
  gap: number
  maxCols?: number
}

const Grid = styled('div')<GridProps>(({colWidth, gap, maxCols}) => ({
  display: 'grid',
  gridColumnGap: gap,
  gridAutoRows: gap / 2,
  gridTemplateColumns: `repeat(${maxCols || 'auto-fill'}, minmax(${colWidth}px, 1fr))`
}))

type SetItemRef = (id: string) => (c: HTMLElement | null) => any
type RenderProp = (setItemRef: SetItemRef) => ReactNode

interface Props extends GridProps {
  children: RenderProp
  items?: any[] | readonly any[]
}

interface ItemRefs {
  [id: string]: HTMLElement
}

const ResizeObserver = window.ResizeObserver || ResizeObserverPolyfill

const MasonryCSSGrid = (props: Props) => {
  const {children, gap, colWidth, maxCols, items} = props
  const itemRefsRef = useRef<ItemRefs>({})
  const gridRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const gapRef = useRef(gap)
  gapRef.current = gap

  const setSpan = useCallback((c: HTMLElement | null) => {
    if (!c || !c.firstElementChild) return
    const g = gapRef.current
    const autoRowHeight = g / 2
    // grabbing the firstChild is dirty, but not as dirty as clearing the style, using a rAF & recalculating
    const rowCount = Math.ceil((c.firstElementChild.scrollHeight + g) / autoRowHeight)
    c.style.gridRowEnd = `span ${rowCount}`
  }, [])

  const setSpans = useCallback(() => {
    Object.values(itemRefsRef.current).forEach((itemRef) => {
      setSpan(itemRef)
    })
  }, [setSpan])

  // Initialize ResizeObserver once
  useEffect(() => {
    resizeObserverRef.current = new ResizeObserver(() => {
      setSpans()
    })
    return () => {
      resizeObserverRef.current?.disconnect()
    }
  }, [setSpans])

  // Window resize listener
  useEffect(() => {
    window.addEventListener('resize', setSpans, {passive: true})
    return () => {
      window.removeEventListener('resize', setSpans)
    }
  }, [setSpans])

  // Recalculate on items change (replaces componentDidUpdate)
  useEffect(() => {
    if (items === undefined) return
    // the setTimeout is required for the task list (issue #2432), but it shouldn't be.
    const timer = setTimeout(() => setSpans())
    return () => {
      clearTimeout(timer)
    }
  }, [items, setSpans])

  const setItemRef: SetItemRef = useCallback(
    (id) => (c) => {
      const el = c || itemRefsRef.current[id]
      if (c) {
        itemRefsRef.current[id] = c
        setSpan(c)
      } else {
        delete itemRefsRef.current[id]
      }
      const method = c ? 'observe' : 'unobserve'
      if (el?.firstElementChild && resizeObserverRef.current) {
        resizeObserverRef.current[method](el.firstElementChild)
      }
    },
    [setSpan]
  )

  return (
    <Grid gap={gap} colWidth={colWidth} maxCols={maxCols} ref={gridRef}>
      {children(setItemRef)}
    </Grid>
  )
}

export default MasonryCSSGrid
