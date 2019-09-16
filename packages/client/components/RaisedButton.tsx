import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import {PALETTE} from '../styles/paletteV2'
import BaseButton, {BaseButtonProps} from './BaseButton'
import {Elevation} from '../styles/elevation'

const StyledBaseButton = styled(BaseButton)<{palette?: string}>(({palette = 'gray'}) => {
  const backgroundColor = ui.palette[palette]
  const color = ui.buttonLightThemes.includes(palette) ? PALETTE.TEXT_MAIN : '#FFFFFF'
  return {
    backgroundColor,
    borderRadius: ui.buttonBorderRadius,
    color,
    fontWeight: 600,
    outline: 0
  }
})

export interface RaisedButtonProps extends BaseButtonProps {
  palette?: string
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
