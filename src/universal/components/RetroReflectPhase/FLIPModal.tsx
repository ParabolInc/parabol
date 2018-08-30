import React, {Component, ReactChild} from 'react'
import styled from 'react-emotion'
import getTransform from 'universal/components/RetroReflectPhase/getTransform'
import setElementBBox from 'universal/components/RetroReflectPhase/setElementBBox'
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

const PADDING = 16

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

  move() {
    const {getParentBBox} = this.props
    const backgroundDiv = this.backgroundRef.current
    const first = backgroundDiv.getBoundingClientRect()
    const height = this.childBBox.height + PADDING * 2
    const width = this.childBBox.width + PADDING * 2
    const maxBBox = getParentBBox()
    const top = (maxBBox.height - this.childBBox.height) / 2 + maxBBox.top - PADDING
    const left = (maxBBox.width - this.childBBox.width) / 2 + maxBBox.left - PADDING
    const last = {top, left, width, height}
    const {style: bgStyle} = backgroundDiv

    const contentDiv = this.contentRef.current
    const contentBBox = contentDiv.getBoundingClientRect()
    const contentLast = {left: left + PADDING, top: top + PADDING}
    setElementBBox(contentDiv, contentLast)
    contentDiv.style.transform = getTransform(contentBBox, contentLast)
    contentDiv.style.transition = null

    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.transition = null
    requestDoubleAnimationFrame(() => {
      contentDiv.style.transition = `all 300ms ${DECELERATE}`
      contentDiv.style.transform = null
      bgStyle.transition = `all 300ms ${DECELERATE}`
      bgStyle.transform = null
    })
  }


  animateIn() {
    const {childrenLen, getFirst, getParentBBox} = this.props
    const backgroundDiv = this.backgroundRef.current
    const height = this.childBBox.height + PADDING * 2
    const width = this.childBBox.width + PADDING * 2
    const maxBBox = getParentBBox()
    const first = getFirst()
    const top = (maxBBox.height - this.childBBox.height) / 2 + maxBBox.top - PADDING
    const left = (maxBBox.width - this.childBBox.width) / 2 + maxBBox.left - PADDING
    const last = {top, left, height, width}

    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    const {style: bgStyle} = backgroundDiv

    const contentLast = {top: top + PADDING, left: left + PADDING}
    const contentDiv = this.contentRef.current
    setElementBBox(contentDiv, contentLast)

    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'

    requestDoubleAnimationFrame(() => {
      bgStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
      bgStyle.transform = null
      bgStyle.opacity = null
    })
  }

  animateOut() {
    const {childrenLen, close, getFirst} = this.props
    const first = getFirst()
    const backgroundDiv = this.backgroundRef.current
    const last = backgroundDiv.getBoundingClientRect()
    const {style: bgStyle} = backgroundDiv
    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    bgStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'
    backgroundDiv.addEventListener('transitionend', close)
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isClosing && this.props.isClosing) {
      this.animateOut()
    }
  }

  setBBox = (childBBox) => {
    const isInit = !this.childBBox
    this.childBBox = childBBox
    if (!isInit) {
      this.move()
    }
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
