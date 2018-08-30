import * as React from 'react'
import {cloneElement, Component, ComponentElement} from 'react'
import {findDOMNode} from 'react-dom'
import ChildrenCache from 'universal/components/RetroReflectPhase/ChildrenCache'
import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'
import ParentCache from 'universal/components/RetroReflectPhase/ParentCache'
import {CARD_PADDING, REFLECTION_CARD_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'

interface Props {
  getFirst(): BBox | null

  getParentBBox(): BBox | null

  isClosing: boolean

  setBBox(bbox: BBox): void
}

interface State {
  children: Array<ComponentElement<any, any>>
}

class FLIPGrid extends Component<Props, State> {
  childrenCache = new ChildrenCache()
  parentCache = new ParentCache()
  first: BBox

  constructor(props) {
    super(props)
    this.first = props.getFirst()
    const children = this.makeReffedChildren(props.children)
    this.state = {
      children
    }
  }

  componentDidMount() {
    const el = findDOMNode(this) as HTMLElement
    this.parentCache.el = el
    const maxBBox = this.props.getParentBBox()
    const dims = this.childrenCache.setGrid(maxBBox.width, CARD_PADDING, REFLECTION_CARD_WIDTH)
    this.parentCache.setCoords(el, dims, maxBBox)
    this.props.setBBox(this.parentCache.bbox)
    this.childrenCache.animateIn(this.first, this.parentCache.bbox)
  }

  componentDidUpdate(prevProps) {
    if (this.props.isClosing && !prevProps.isClosing) {
      this.childrenCache.animateOut(this.first, this.parentCache.bbox)
    }
    const childArray = this.props.children as Array<ComponentElement<any, any>>
    const keysRemoved = this.state.children
      .map((child) => child.key)
      .filter((key) => !childArray.find((child) => child.key === key))
      .map(String)

    if (keysRemoved.length) {
      const dims = this.childrenCache.removeKeys(keysRemoved)
      this.handleGridChange(dims)
    }
  }

  updateChildren = () => {
    this.setState({
      children: this.makeReffedChildren(this.props.children as Array<ComponentElement<any, any>>)
    })
  }

  handleGridChange(dims?: {height: number, width: number}) {
    if (!dims) return
    const maxBBox = this.props.getParentBBox()
    this.parentCache.setCoords(this.parentCache.el, dims, maxBBox)
    this.props.setBBox(this.parentCache.bbox)
    this.updateChildren()
  }

  checkForResize(key: string) {
    const dims = this.childrenCache.maybeResize(key)
    this.handleGridChange(dims)
  }

  makeReffedChildren(children: Array<ComponentElement<any, any>>) {
    return children.map((child) => {
      return cloneElement(child, {
        ref: (c) => {
          if (!c) return
          const el = findDOMNode(c) as HTMLElement
          this.childrenCache.setEl(String(child.key), el)
        }
      })
    })
  }

  render() {
    return (
      <div>
        {this.state.children}
      </div>
    )
  }
}

export default FLIPGrid


