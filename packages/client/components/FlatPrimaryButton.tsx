import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Radius} from '~/types/constEnums'
import BaseButton, {BaseButtonProps} from './BaseButton'

const StyledBaseButton = styled(BaseButton)((props: BaseButtonProps) => {
  const {disabled, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    backgroundImage: visuallyDisabled
      ? PALETTE.GRADIENT_TOMATO_400_ROSE_300
      : PALETTE.GRADIENT_TOMATO_600_ROSE_500,
    borderRadius: Radius.BUTTON_PILL,
    color: '#FFFFFF',
    fontWeight: 600,
    opacity: visuallyDisabled ? 1 : undefined,
    outline: 0,
    ':hover,:focus,:active': {
      backgroundImage: visuallyDisabled
        ? PALETTE.GRADIENT_TOMATO_400_ROSE_300
        : PALETTE.GRADIENT_TOMATO_700_ROSE_600,
      opacity: visuallyDisabled ? 1 : undefined
    }
  }
})

interface Props extends BaseButtonProps {}

const FlatPrimaryButton = forwardRef((props: Props, ref: any) => {
  const {children, className} = props
  return (
    <StyledBaseButton {...props} ref={ref} className={className}>
      {children}
    </StyledBaseButton>
  )
})

export default FlatPrimaryButton
