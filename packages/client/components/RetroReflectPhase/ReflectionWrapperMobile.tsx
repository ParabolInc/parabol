import React, {ReactNode} from 'react'
import SwipeableViews from 'react-swipeable-views'

interface Props {
  children: ReactNode
  activeIdx: number
  setActiveIdx: (number) => void
}

const containerStyle = {height: '100%'}
const innerStyle = { width: '100%', padding: '0 16px'}
const slideContainer = {
  padding: '0 4px',
}
const ReflectWrapperMobile = (props: Props) => {
  const {children, activeIdx, setActiveIdx} = props
  return (
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
  )
}

export default ReflectWrapperMobile
