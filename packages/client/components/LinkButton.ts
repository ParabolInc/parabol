import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import BaseButton, {BaseButtonProps} from './BaseButton'

const paletteColors = {
  blue: PALETTE.TEXT_BLUE,
  dark: PALETTE.TEXT_MAIN,
  gray: PALETTE.TEXT_LIGHT,
  midGray: PALETTE.TEXT_GRAY,
  red: PALETTE.TEXT_RED,
  warm: PALETTE.TEXT_ORANGE,
  white: '#FFFFFF'
}

// mix palete color with 15% black
const hoverColors = {
  blue: PALETTE.TEXT_BLUE_DARK,
  dark: PALETTE.TEXT_MAIN_DARK,
  gray: PALETTE.TEXT_LIGHT_DARK,
  midGray: PALETTE.TEXT_GRAY_DARK,
  red: PALETTE.TEXT_RED_DARK,
  warm: PALETTE.TEXT_ORANGE_DARK,
  white: '#D9D9D9'
}

export interface LinkButtonProps extends BaseButtonProps {
  palette?: keyof typeof paletteColors
}

const LinkButton = styled(BaseButton)<LinkButtonProps>((props) => {
  const {palette = 'dark', disabled, waiting} = props
  const color = paletteColors[palette]
  const hoverColor = hoverColors[palette]
  const visuallyDisabled = disabled || waiting
  return {
    backgroundColor: 'transparent',
    border: 0,
    boxShadow: 'none',
    color,
    padding: 0,
    ':hover,:focus,:active': {
      boxShadow: 'none',
      color: !visuallyDisabled ? hoverColor : undefined
    }
  }
})

export default LinkButton
