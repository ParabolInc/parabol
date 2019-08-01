import React, {ReactNode} from 'react'
import SwipeableViews from 'react-swipeable-views'
import {ElementWidth} from '../../types/constEnums'

interface Props {
  children: ReactNode
  activeIdx: number
  setActiveIdx: (number) => void
}

const containerStyle = {height: '100%', width: ElementWidth.REFLECTION_CARD_PADDED + ElementWidth.REFLECTION_CARD_PADDING * 2}
const innerStyle = {height: '100%'}

const ReflectWrapperMobile = (props: Props) => {
  const {children, activeIdx, setActiveIdx} = props
  return (
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        {children}
      </SwipeableViews>
  )
}

export default ReflectWrapperMobile
