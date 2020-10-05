import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'

const EstimateArea = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100%'
})

const SwipableColumnWrapper = styled('div')({
  display: 'flex',
  padding: '0 16px',
  height: '100%',
  width: '100%'
})

const SwipableColumn = styled('div')({
  backgroundColor: PALETTE.BACKGROUND_REFLECTION,
  borderRadius: 8,
  position: 'relative',
  height: '100%',
  width: '100%'
})

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

  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }

  return (
    <EstimateArea>
      <StepperDots>
        {[1, 2, 3].map((_, idx) => {
          return <StepperDot key={`${idx}-${_}`} isFocused={idx === activeIdx} />
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
          <SwipableColumnWrapper key={idx}>
            <SwipableColumn></SwipableColumn>
          </SwipableColumnWrapper>
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

export default EstimatePhaseArea
