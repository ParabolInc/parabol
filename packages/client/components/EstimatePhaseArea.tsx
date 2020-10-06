import React, {useState} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '~/styles/paletteV2'
import SwipeableViews from 'react-swipeable-views'

const EstimateArea = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%'
})

const StepperDots = styled('div')({
  justifyContent: 'center',
  position: 'relative',
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

const SwipableColumnWrapper = styled('div')({
  display: 'flex',
  height: '100%',
  borderRadius: '8px',
  background: PALETTE.BACKGROUND_REFLECTION,
  width: '100%',
  justifyContent: 'center',
  padding: 32
})

const styles = {
  root: {
    display: 'flex',
    height: '100%',
    padding: '0 10%',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '60%',
    overflow: 'visible'
  },
  slideContainer: {
    height: '100%',
    padding: '0 5%'
  }
}

const containerStyle = {
  height: '100%'
}

const EstimatePhaseArea = () => {
  const [activeIdx, setActiveIdx] = useState(1)
  console.log('EstimatePhaseArea -> activeIdx', activeIdx)

  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    console.log('Hey!')
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }

  const dummyEstimateItems = [1, 2, 3]

  return (
    <EstimateArea>
      <StepperDots>
        {dummyEstimateItems.map((_, idx) => {
          return <StepperDot key={`${idx}-${_}`} isFocused={idx === activeIdx} />
        })}
      </StepperDots>
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        style={styles.root}
        containerStyle={containerStyle}
        slideStyle={styles.slideContainer}
      >
        {dummyEstimateItems.map((_, idx) => (
          <SwipableColumnWrapper key={idx} />
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

export default EstimatePhaseArea
