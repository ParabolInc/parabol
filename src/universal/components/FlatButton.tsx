import React, {ReactNode, RefObject} from 'react'
import styled from '@emotion/styled'
import ui from 'universal/styles/ui'
import BaseButton from 'universal/components/BaseButton'

export interface FlatButtonProps {
  size?: 'small' | 'medium' | 'large'
  children?: ReactNode
  disabled?: boolean
  innerRef?: RefObject<HTMLElement>
  onClick?: (e: React.MouseEvent) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  palette?: 'warm' | 'mid' | 'dark'
  style?: object
  waiting?: boolean
}

const FlatButton = styled(BaseButton)<FlatButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const backgroundColorOnHover = ui.buttonLightThemes.includes(palette)
    ? 'rgba(0, 0, 0, .15)'
    : ui.palette.light
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
