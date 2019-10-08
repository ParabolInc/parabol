import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {Radius} from '../types/constEnums'
import BaseButton, {BaseButtonProps} from './BaseButton'
import {Elevation} from '../styles/elevation'

const paletteColors = {
  gray: PALETTE.TEXT_LIGHT,
  warm: PALETTE.TEXT_ORANGE,
  pink: PALETTE.EMPHASIS_WARM,
  mid: PALETTE.TEXT_PURPLE,
  dark: PALETTE.TEXT_MAIN,
  blue: PALETTE.TEXT_BLUE,
  white: '#FFFFFF'
}

const buttonLightThemes = ['white', 'gray']

const StyledBaseButton = styled(BaseButton)<{palette?: string}>(({palette = 'gray'}) => {
  const backgroundColor = paletteColors[palette]
  const color = buttonLightThemes.includes(palette) ? PALETTE.TEXT_MAIN : '#FFFFFF'
  return {
    backgroundColor,
    borderRadius: Radius.BUTTON_PILL,
    color,
    fontWeight: 600,
    outline: 0
  }
})

export interface RaisedButtonProps extends BaseButtonProps {
  palette?: keyof typeof paletteColors
}

const RaisedButton = forwardRef((props: RaisedButtonProps, ref: Ref<HTMLButtonElement>) => {
  const {children, className, elevationPressed, elevationHovered, elevationResting} = props
  return (
    <StyledBaseButton
      {...props}
      className={className}
      elevationHovered={elevationHovered || Elevation.Z8}
      elevationResting={elevationResting || Elevation.Z2}
      elevationPressed={elevationPressed || Elevation.Z5}
      ref={ref}
    >
      {children}
    </StyledBaseButton>
  )
})

export default RaisedButton
