import React, {Component, ReactNode} from 'react'
import styled from 'react-emotion'
import ResizeObserverPolyfill from 'resize-observer-polyfill'

interface GridProps {
  colWidth: number
  gap: number
  maxCols?: number
}

const Grid = styled('div')(({colWidth, gap, maxCols}: GridProps) => ({
  display: 'grid',
  gridColumnGap: gap,
  gridAutoRows: gap / 2,
  gridTemplateColumns: `repeat(${maxCols || 'auto-fill'}, minmax(${colWidth}, 1fr))`
}))

type SetItemRef = (id: string) => (c: HTMLElement | null) => any
type RenderProp = (setItemRef: SetItemRef) => ReactNode

interface Props extends GridProps {
  children: RenderProp
  items?: Array<any>
}

interface ItemRefs {
  [id: string]: HTMLElement
}

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill
class MasonryCSSGrid extends Component<Props> {
  itemRefs: ItemRefs = {}
  gridRef = React.createRef<HTMLDivElement>()
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      this.setSpan(entry.target.parentElement)
    }
  })

  componentDidMount () {
    window.addEventListener('resize', this.setSpans, {passive: true})
  }

  componentDidUpdate (prevProps) {
    if (this.props.items !== prevProps.items) {
      // the setTimeout is required for the task list (issue #2432), but it shouldn't be.
      setTimeout(() => this.setSpans())
    }
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.setSpans)
    this.resizeObserver.disconnect()
  }

  setSpans = () => {
    const keys = Object.keys(this.itemRefs)
    for (let ii = 0; ii < keys.length; ii++) {
      const key = keys[ii]
      const itemRef = this.itemRefs[key]
      this.setSpan(itemRef)
    }
  }

  setSpan (c: HTMLElement | null) {
    if (!c || !c.firstElementChild) return
    const {gap} = this.props
    const autoRowHeight = gap / 2
    // grabbing the firstChild is dirty, but not as dirty as clearing the style, using a rAF & recalculating
    const rowCount = Math.ceil((c.firstElementChild.scrollHeight + gap) / autoRowHeight)
    c.style.gridRowEnd = `span ${rowCount}`
  }

  setItemRef: SetItemRef = (id) => (c) => {
    const el = c || this.itemRefs[id]
    if (c) {
      this.itemRefs[id] = c
      this.setSpan(c)
    } else {
      delete this.itemRefs[id]
    }
    const method = c ? 'observe' : 'unobserve'
    if (el.firstElementChild) {
      this.resizeObserver[method](el.firstElementChild)
    }
  }

  render () {
    const {children, gap, colWidth, maxCols} = this.props
    return (
      <Grid gap={gap} colWidth={colWidth} maxCols={maxCols} innerRef={this.gridRef}>
        {children(this.setItemRef)}
      </Grid>
    )
  }
}

export default MasonryCSSGrid
