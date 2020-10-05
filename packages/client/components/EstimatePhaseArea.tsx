import React, {useState} from 'react'
import styled from '@emotion/styled'
import {Breakpoint, Gutters} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import {DECELERATE} from '~/styles/animation'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'
const EstimateArea = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  minHeight: isDesktop ? undefined : '100%'
}))

const SwipableColumn = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  display: 'flex',
  // flex: 1,
  // flexDirection: 'row',
  // flexShrink: 0,
  // height: isDesktop ? undefined : '100%',
  maxHeight: isDesktop ? 640 : undefined,
  overflow: 'hidden',
  position: 'relative',
  transition: `background 150ms ${DECELERATE}`,
  width: '100%',
  margin: '0 16px',
  height: '100%'
}))

const StepperDots = styled('div')({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  padding: '8px 0'
})

const StepperDot = styled('div')<{isFocused: boolean}>(({isFocused}) => ({
  backgroundColor: isFocused ? PALETTE.STATUS_ACTIVE : PALETTE.TEXT_GRAY,
  borderRadius: '50%',
  height: 8,
  margin: '0 2px',
  opacity: isFocused ? undefined : 0.35,
  width: 8
}))

const containerStyle = {height: '100%', width: '40%'}
const innerStyle = {
  height: '100%',
  width: '100%',
  display: 'flex',
  justifyContent: 'center'
}

const EstimatePhaseArea = () => {
  const [activeIdx, setActiveIdx] = useState(1)
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }

  return (
    <EstimateArea isDesktop={isDesktop}>
      <StepperDots>
        {[1, 2, 3].map((_, idx) => {
          return <StepperDot isFocused={idx === activeIdx} key={idx} />
        })}
      </StepperDots>
      <SwipeableViews
        containerStyle={containerStyle}
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        style={innerStyle}
      >
        {[1, 2, 3].map((_, idx) => (
          <SwipableColumn key={`${_}-${idx}`} isDesktop={isDesktop}></SwipableColumn>
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

export default EstimatePhaseArea
