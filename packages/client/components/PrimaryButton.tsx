import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import {Radius} from '~/types/constEnums'
import BaseButton, {BaseButtonProps} from './BaseButton'

const StyledBaseButton = styled(BaseButton)((props: BaseButtonProps) => {
  const {disabled, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    backgroundImage: visuallyDisabled ? PALETTE.GRADIENT_WARM_LIGHTENED : PALETTE.GRADIENT_WARM,
    borderRadius: Radius.BUTTON_PILL,
    color: '#FFFFFF',
    fontWeight: 600,
    opacity: visuallyDisabled ? 1 : undefined,
    outline: 0,
    ':hover,:focus,:active': {
      backgroundImage: visuallyDisabled
        ? PALETTE.GRADIENT_WARM_LIGHTENED
        : PALETTE.GRADIENT_WARM_DARKENED,
      opacity: visuallyDisabled ? 1 : undefined
    }
  }
})

interface Props extends BaseButtonProps {}

const PrimaryButton = forwardRef((props: Props, ref: any) => {
  const {children, className, elevationHovered, elevationResting} = props
  return (
    <StyledBaseButton
      {...props}
      ref={ref}
      className={className}
      elevationHovered={elevationHovered || Elevation.Z8}
      elevationResting={elevationResting || Elevation.Z2}
      elevationPressed={elevationResting || Elevation.Z5}
    >
      {children}
    </StyledBaseButton>
  )
})

export default PrimaryButton
