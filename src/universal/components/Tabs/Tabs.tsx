import React, {Children, cloneElement, Component, ReactElement, ReactNode} from 'react'
import styled from 'react-emotion'
import Tab from 'universal/components/Tab/Tab'
import {PALETTE} from 'universal/styles/paletteV2'

interface Props {
  activeIdx: number
  children: ReactNode
  className?: string
}

const INKBAR_HEIGHT = 2

const InkBar = styled('div')({
  height: INKBAR_HEIGHT,
  background: PALETTE.PRIMARY.DARK,
  position: 'absolute',
  transformOrigin: 'left',
  width: 1000
})

const TabsAndBar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '24rem',
  position: 'relative',
  width: '100%'
})

const TabHeaders = styled('div')({
  display: 'flex',
  width: '100%'
})

class Tabs extends Component<Props> {
  activeChildRef?: Tab
  parentRef?: HTMLDivElement

  state = {
    transform: ''
  }
  setChildRef = (c) => {
    this.activeChildRef = c
  }

  setParentRef = (c) => {
    if (c && c !== this.parentRef) {
      const childBBox = this.activeChildRef && this.activeChildRef.getBoundingRect()
      if (childBBox) {
        const parentBBox = c.getBoundingClientRect()
        if (parentBBox) {
          const left = childBBox.left - parentBBox.left
          const top = childBBox.top - parentBBox.top + childBBox.height - INKBAR_HEIGHT
          this.setState({
            transform: `translate3d(${left}px, ${top}px, 0)scaleX(${childBBox.width / 1000})`
          })
        }
      }
    }
    this.activeChildRef = c
  }

  render () {
    const {activeIdx, children, className} = this.props
    const {transform} = this.state
    const properChildren = Children.map(children, (child, idx) => {
      const isActive = idx === activeIdx
      return cloneElement(child as ReactElement<any>, {
        isActive,
        ref: isActive ? this.setChildRef : null
      })
    })
    return (
      <TabsAndBar className={className} innerRef={this.setParentRef}>
        <TabHeaders>{properChildren}</TabHeaders>
        <InkBar style={{transform}} />
      </TabsAndBar>
    )
  }
}

export default Tabs
