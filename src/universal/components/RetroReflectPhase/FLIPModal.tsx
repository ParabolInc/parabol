import React, {Component, ReactChild} from 'react'
import styled from 'react-emotion'
import getBBox from 'universal/components/RetroReflectPhase/getBBox'
import getTransform from 'universal/components/RetroReflectPhase/getTransform'
import setElementBBox from 'universal/components/RetroReflectPhase/setElementBBox'
import {BBox} from 'universal/components/RetroReflectPhase/FLIPModal'
import getStaggerDelay from 'universal/components/RetroReflectPhase/getStaggerDelay'
import requestDoubleAnimationFrame from 'universal/components/RetroReflectPhase/requestDoubleAnimationFrame'
import {DECELERATE} from 'universal/styles/animation'
import {ZINDEX_MODAL} from 'universal/styles/elevation'
import {ITEM_DURATION, MIN_ITEM_DELAY} from 'universal/utils/multiplayerMasonry/masonryConstants'
import hideBodyScroll from 'universal/utils/hideBodyScroll'

export interface BBox {
  height: number
  width: number
  top: number
  left: number
}

interface Props {
  childrenLen: number

  getFirst(): BBox | null

  getParentBBox(): BBox | null

  children(setBBox: (bbox: BBox) => void): ReactChild
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
  childBBox: BBox | null = null
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
    const contentDiv = this.contentRef.current
    if (!backgroundDiv || !contentDiv || !this.childBBox) return
    const first = getBBox(backgroundDiv)
    const maxBBox = getParentBBox()
    const contentBBox = getBBox(contentDiv)
    if (!contentBBox || !maxBBox || !first) return
    const height = this.childBBox.height
    const width = this.childBBox.width
    const top = (maxBBox.height - this.childBBox.height) / 2 + maxBBox.top
    const left = (maxBBox.width - this.childBBox.width) / 2 + maxBBox.left
    const last = {top, left, width, height}
    const {style: bgStyle} = backgroundDiv

    setElementBBox(contentDiv, last)
    contentDiv.style.transform = getTransform(contentBBox, last)
    contentDiv.style.transition = null
    contentDiv.style.overflow = ''

    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.transition = null

    requestDoubleAnimationFrame(() => {
      contentDiv.style.transition = `all 300ms ${DECELERATE}`
      contentDiv.style.transform = null
      bgStyle.transition = `all 300ms ${DECELERATE}`
      bgStyle.transform = null
    })
    const cleanup = () => {
      backgroundDiv.removeEventListener('transitionend', cleanup)
      contentDiv.style.overflowX = 'hidden'
      contentDiv.style.overflowY = 'auto'
    }
    backgroundDiv.addEventListener('transitionend', cleanup)
  }

  animateIn() {
    const {childrenLen, getFirst, getParentBBox} = this.props
    const backgroundDiv = this.backgroundRef.current
    const contentDiv = this.contentRef.current
    if (!this.childBBox || !backgroundDiv || !contentDiv) return
    const height = this.childBBox.height
    const width = this.childBBox.width
    const maxBBox = getParentBBox()
    const first = getFirst()
    if (!first || !maxBBox) return
    const top = (maxBBox.height - this.childBBox.height) / 2 + maxBBox.top
    const left = (maxBBox.width - this.childBBox.width) / 2 + maxBBox.left
    const last = {top, left, height, width}

    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    const {style: bgStyle} = backgroundDiv

    setElementBBox(contentDiv, last)
    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'
    const resetBodyStyles = hideBodyScroll()
    requestDoubleAnimationFrame(() => {
      bgStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
      bgStyle.transform = null
      bgStyle.opacity = null
    })
    const cleanup = () => {
      backgroundDiv.removeEventListener('transitionend', cleanup)
      contentDiv.style.overflowX = 'hidden'
      contentDiv.style.overflowY = 'auto'
      resetBodyStyles()
    }
    backgroundDiv.addEventListener('transitionend', cleanup)
  }

  animateOut() {
    const {childrenLen, close, getFirst} = this.props
    const first = getFirst()
    const backgroundDiv = this.backgroundRef.current
    const contentDiv = this.contentRef.current
    const last = getBBox(backgroundDiv)
    if (!first || !last || !backgroundDiv || !contentDiv) return
    const {style: bgStyle} = backgroundDiv
    const staggerDelay = getStaggerDelay(childrenLen)
    const totalDuration = MIN_ITEM_DELAY + ITEM_DURATION + staggerDelay * childrenLen
    contentDiv.style.overflow = ''
    const resetBodyStyles = hideBodyScroll()
    bgStyle.transition = `all ${totalDuration}ms ${DECELERATE}`
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'
    const cleanup = () => {
      backgroundDiv.removeEventListener('transitionend', cleanup)
      close()
      resetBodyStyles()
    }
    backgroundDiv.addEventListener('transitionend', cleanup)
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
        <ModalContent innerRef={this.contentRef}>{this.props.children(this.setBBox)}</ModalContent>
      </React.Fragment>
    )
  }
}

export default FLIPModal
