import React, {Component, ReactChild} from 'react'
import styled from 'react-emotion'
import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'
import getStaggerDelay from 'universal/components/RetroReflectPhase/getStaggerDelay'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import {DECELERATE} from 'universal/styles/animation'
import {ZINDEX_MODAL} from 'universal/styles/elevation'
import {ITEM_DURATION, MIN_ITEM_DELAY} from 'universal/utils/multiplayerMasonry/masonryConstants'

export interface BBox {
  height: number,
  width: number,
  top: number,
  left: number
}

interface Props {
  childrenLen: number,

  getFirst(): BBox | null,

  getParentBBox(): BBox | null,

  children(setBBox: (bbox: BBox) => void): ReactChild,
  isClosing: boolean
  close(): void
}

const ModalBackground = styled('div')({
  backgroundColor: 'rgba(68, 66, 88, .65)',
  borderRadius: 4,
  position: 'absolute',
  transformOrigin: '0 0',
  zIndex: ZINDEX_MODAL
})

const ModalContent = styled('div')({
  position: 'absolute',
  zIndex: ZINDEX_MODAL
})

class FLIPModal extends Component<Props> {
  childBBox: BBox
  backgroundRef = React.createRef<HTMLDivElement>()
  contentRef = React.createRef<HTMLDivElement>()

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.animateIn()
  }

  animateIn() {
    const PADDING = 16
    const {childrenLen, getFirst, getParentBBox} = this.props
    const backgroundDiv = this.backgroundRef.current
    const height = this.childBBox.height + PADDING * 2
    const width = this.childBBox.width + PADDING * 2
    const maxBBox = getParentBBox()
    const first = getFirst()
    const top = (maxBBox.height - this.childBBox.height) / 2 + maxBBox.top - PADDING
    const left = (maxBBox.width - this.childBBox.width) / 2 + maxBBox.left - PADDING
    const contentDiv = this.contentRef.current
    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    const dX = first.left - left
    const dY = first.top - top
    const scaleY = first.height / height
    const scaleX = first.width / width
    const {style: elStyle} = backgroundDiv


    contentDiv.style.top = `${top + PADDING}px`
    contentDiv.style.left = `${left + PADDING}px`

    elStyle.width = `${width}px`
    elStyle.height = `${height}px`
    elStyle.top = `${top}px`
    elStyle.left = `${left}px`
    elStyle.transform = `translate(${dX}px,${dY}px) scale(${scaleX},${scaleY})`
    elStyle.opacity = '0'

    requestDoubleAnimationFrame(() => {
      elStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
      elStyle.transform = null
      elStyle.opacity = null
    })
  }

  animateOut() {
    const {childrenLen, close, getFirst} = this.props
    const first = getFirst()
    const backgroundDiv = this.backgroundRef.current
    const bbox = backgroundDiv.getBoundingClientRect()
    const {style: elStyle} = backgroundDiv
    const dX = first.left - bbox.left
    const dY = first.top - bbox.top
    const scaleY = first.height / bbox.height
    const scaleX = first.width / bbox.width
    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    elStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
    elStyle.transform = `translate(${dX}px,${dY}px) scale(${scaleX},${scaleY})`
    elStyle.opacity = '0'
    backgroundDiv.addEventListener('transitionend', close)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isClosing && this.props.isClosing) {
      this.animateOut()
    }
  }

  setBBox = (childBBox) => {
    this.childBBox = childBBox
  }

  render() {
    return (
      <React.Fragment>
        <ModalBackground innerRef={this.backgroundRef} />
        <ModalContent innerRef={this.contentRef}>
          {this.props.children(this.setBBox)}
        </ModalContent>
      </React.Fragment>
    )
  }
}

export default FLIPModal
