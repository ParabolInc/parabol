import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import {PALETTE} from '../styles/paletteV2'
import BaseButton, {BaseButtonProps} from './BaseButton'

export interface FlatButtonProps extends BaseButtonProps{
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  disabled?: boolean
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  palette?: 'warm' | 'mid' | 'dark' | 'blue'
  style?: object
  waiting?: boolean
}

const FlatButton = styled(BaseButton)<FlatButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const backgroundColorOnHover = ui.buttonLightThemes.includes(palette)
    ? 'rgba(0, 0, 0, .15)'
    : PALETTE.BACKGROUND_MAIN
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    borderRadius: ui.buttonBorderRadius,
    color: ui.palette[palette],
    outline: 0,
    ':hover,:focus,:active': {
      backgroundColor: !visuallyDisabled && backgroundColorOnHover,
      boxShadow: 'none'
    }
  }
})

export default FlatButton
