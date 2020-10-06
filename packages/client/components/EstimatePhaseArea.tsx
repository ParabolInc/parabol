import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'

const EstimateArea = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%'
})

const StepperDots = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  padding: '16px 0'
})

const StepperDot = styled('div')<{isActive: boolean}>(({isActive}) => ({
  backgroundColor: isActive ? PALETTE.STATUS_ACTIVE : PALETTE.TEXT_GRAY,
  borderRadius: '50%',
  height: 8,
  margin: '0 2px',
  opacity: isActive ? undefined : 0.35,
  width: 8
}))

const SwipableEstimateItem = styled('div')({
  borderRadius: '8px 8px 0 0',
  background: PALETTE.BACKGROUND_REFLECTION,
  height: '100%'
})

const innerStyle = (isDesktop: boolean) => {
  return {
    height: '100%',
    padding: isDesktop ? '0 10%' : '0 40px',
    width: isDesktop ? '75%' : '100%',
    overflow: 'visible'
  }
}

const slideContainer = {
  padding: '0 16px'
}

const containerStyle = {
  height: '100%'
}

const EstimatePhaseArea = () => {
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const onChangeIdx = (idx) => {
    setActiveIdx(idx)
  }

  const dummyEstimateItems = [1, 2, 3]

  return (
    <EstimateArea>
      <StepperDots>
        {dummyEstimateItems.map((_, idx) => {
          return <StepperDot key={idx} isActive={idx === activeIdx} />
        })}
      </StepperDots>
      <SwipeableViews
        containerStyle={containerStyle}
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        slideStyle={slideContainer}
        style={innerStyle(isDesktop)}
      >
        {dummyEstimateItems.map((_, idx) => (
          <SwipableEstimateItem key={idx} />
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

export default EstimatePhaseArea
