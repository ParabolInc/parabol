import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import BaseButton, {type BaseButtonProps} from './BaseButton'

const paletteColors = {
  blue: PALETTE.SKY_500,
  // theme-aware (SLATE_700 == fg-primary's light value; SLATE_600 == fg-secondary's) so these
  // neutral link palettes stop rendering dark-on-dark in dark mode.
  dark: 'var(--color-fg-primary)',
  gray: PALETTE.SLATE_200,
  midGray: 'var(--color-fg-secondary)',
  red: PALETTE.TOMATO_600,
  warm: PALETTE.GOLD_500,
  white: '#FFFFFF'
}

// mix palete color with ~15% black
const hoverColors = {
  blue: PALETTE.SKY_600,
  // hover LIGHTENS in dark (toward fg-primary) instead of darkening into the surface.
  dark: 'var(--color-accent)',
  gray: PALETTE.SLATE_400,
  midGray: 'var(--color-fg-primary)',
  red: PALETTE.TOMATO_800,
  warm: PALETTE.GOLD_700,
  white: PALETTE.SLATE_300
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
