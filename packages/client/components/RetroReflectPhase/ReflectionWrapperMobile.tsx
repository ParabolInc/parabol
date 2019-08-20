import React, {Children, ReactNode} from 'react'
import SwipeableViews from 'react-swipeable-views'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import Icon from '../Icon'

interface Props {
  children: ReactNode
  activeIdx: number
  setActiveIdx: (number) => void
  focusedIdx: number
}

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', padding: '0 16px'}
const slideContainer = {
  padding: '0 4px'
}

const StepperDots = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '16px 0'
})

const StepperDot = styled('div')<{isLocal: boolean, isFocused: boolean}>(({isLocal, isFocused}) => ({
  backgroundColor: isLocal ? PALETTE.CONTROL_MAIN : isFocused ? PALETTE.TEXT_PINK : PALETTE.TEXT_LIGHT,
  borderRadius: '50%',
  margin: '0 2px',
  height: 8,
  width: 8
}))

const ReflectWrapperMobile = (props: Props) => {
  const {children, activeIdx, setActiveIdx, focusedIdx} = props
  const childArr = Children.toArray(children)
  return (
    <>
      <SwipeableViews
        // required! repro: swipe on a stack where length === 1. caused by the delete button.
        ignoreNativeScroll
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        containerStyle={containerStyle}
        style={innerStyle}
        slideStyle={slideContainer}
      >
        {children}
      </SwipeableViews>
      <StepperDots>
        <Icon onClick={() => setActiveIdx(Math.max(0, activeIdx - 1))}>navigate_before</Icon>
        {childArr.map((_, idx) => {
          return <StepperDot key={idx} isLocal={idx === activeIdx} isFocused={idx === focusedIdx} onClick={() => setActiveIdx(idx)} />
        })}
        <Icon onClick={() => setActiveIdx(Math.min(childArr.length -1, activeIdx + 1))}>navigate_next</Icon>
      </StepperDots>
    </>
  )
}

export default ReflectWrapperMobile
