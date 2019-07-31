import React, {Component, ReactChild} from 'react'
import styled from '@emotion/styled'
import getBBox from './getBBox'
import getTransform from './getTransform'
import setElementBBox from './setElementBBox'
import {BBox} from '../../types/animations'
import requestDoubleAnimationFrame from './requestDoubleAnimationFrame'
import {DECELERATE} from '../../styles/animation'
import {ZINDEX_MODAL} from '../../styles/elevation'
import {ITEM_DURATION} from '../../utils/multiplayerMasonry/masonryConstants'
import hideBodyScroll from '../../utils/hideBodyScroll'

interface Props {
  childrenLen: number

  getFirst (): BBox | null

  getParentBBox (): BBox | null

  children (setBBox: (bbox: BBox) => void): ReactChild
  isClosing: boolean
  close (): void
}

const ModalBackground = styled('div')({
  backgroundColor: 'rgba(68, 66, 88, .65)',
  borderRadius: 8,
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

  constructor (props) {
    super(props)
  }

  componentDidMount () {
    this.animateIn()
  }

  move () {
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
    contentDiv.style.transition = ''
    contentDiv.style.overflow = ''

    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.transition = ''

    requestDoubleAnimationFrame(() => {
      contentDiv.style.transition = `all 300ms ${DECELERATE}`
      contentDiv.style.transform = null
      bgStyle.transition = `all 300ms ${DECELERATE}`
      bgStyle.transform = null
    })
    const cleanup = () => {
      contentDiv.style.overflowX = 'hidden'
      contentDiv.style.overflowY = 'auto'
    }
    backgroundDiv.addEventListener('transitionend', cleanup, {passive: true, once: true})
  }

  animateIn () {
    const {getFirst, getParentBBox} = this.props
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

    const {style: bgStyle} = backgroundDiv

    setElementBBox(contentDiv, last)
    setElementBBox(backgroundDiv, last)
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'
    const resetBodyStyles = hideBodyScroll()
    requestDoubleAnimationFrame(() => {
      bgStyle.transition = `all ${ITEM_DURATION}ms ${DECELERATE}`
      bgStyle.transform = null
      bgStyle.opacity = null
    })
    const cleanup = () => {
      contentDiv.style.overflowX = 'hidden'
      contentDiv.style.overflowY = 'auto'
      resetBodyStyles()
    }
    backgroundDiv.addEventListener('transitionend', cleanup, {passive: true, once: true})
  }

  animateOut () {
    const {close, getFirst} = this.props
    const first = getFirst()
    const backgroundDiv = this.backgroundRef.current
    const contentDiv = this.contentRef.current
    const last = getBBox(backgroundDiv)
    if (!first || !last || !backgroundDiv || !contentDiv) return
    const {style: bgStyle} = backgroundDiv
    contentDiv.style.overflow = ''
    const resetBodyStyles = hideBodyScroll()
    bgStyle.transition = `all ${ITEM_DURATION}ms ${DECELERATE}`
    bgStyle.transform = getTransform(first, last, {scale: true})
    bgStyle.opacity = '0'
    const cleanup = () => {
      close()
      resetBodyStyles()
    }
    backgroundDiv.addEventListener('transitionend', cleanup, {passive: true, once: true})
  }

  componentDidUpdate (prevProps) {
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

  render () {
    return (
      <React.Fragment>
        <ModalBackground ref={this.backgroundRef} />
        <ModalContent ref={this.contentRef}>{this.props.children(this.setBBox)}</ModalContent>
      </React.Fragment>
    )
  }
}

export default FLIPModal
