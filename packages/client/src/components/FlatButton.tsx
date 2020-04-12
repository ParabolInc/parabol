import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {Radius} from '../types/constEnums'
import BaseButton, {BaseButtonProps} from './BaseButton'

const paletteColors = {
  warm: PALETTE.TEXT_ORANGE,
  mid: PALETTE.TEXT_PURPLE,
  dark: PALETTE.TEXT_MAIN,
  blue: PALETTE.TEXT_BLUE
}

export interface FlatButtonProps extends BaseButtonProps {
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  palette?: keyof typeof paletteColors
  style?: object
  waiting?: boolean
}

const FlatButton = styled(BaseButton)<FlatButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    borderRadius: Radius.BUTTON_PILL,
    color: paletteColors[palette],
    outline: 0,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled ? PALETTE.BACKGROUND_MAIN : undefined,
      boxShadow: 'none'
    }
  }
})

export default FlatButton
