import React from 'react'
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

const ColumnHighlight = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
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

const containerStyle = {height: '100%', width: '60%'}
const innerStyle = {
  height: '100%',
  width: '100%',

  display: 'flex',
  justifyContent: 'center'
}

const EstimatePhaseArea = () => {
  const isDesktop = useBreakpoint(Breakpoint.SINGLE_REFLECTION_COLUMN)

  return (
    <EstimateArea isDesktop={isDesktop}>
      <SwipeableViews
        enableMouseEvents
        index={1}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        {[1, 2, 3].map((_) => (
          <ColumnHighlight isDesktop={isDesktop}></ColumnHighlight>
        ))}
      </SwipeableViews>
    </EstimateArea>
  )
}

export default EstimatePhaseArea
