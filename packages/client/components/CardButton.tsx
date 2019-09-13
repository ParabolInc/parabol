import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import BaseButton from './BaseButton'
import {cardContentLineHeight} from '../styles/cards'

const buttonSize = 24

const CardButton = styled(BaseButton)({
  alignItems: 'center',
  borderRadius: buttonSize,
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  height: buttonSize,
  justifyContent: 'center',
  lineHeight: cardContentLineHeight,
  minWidth: buttonSize,
  opacity: .5,
  outline: 0,
  padding: 0,
  ':hover, :focus': {
    backgroundColor: PALETTE.BACKGROUND_MAIN,
    opacity: 1
  }
})

export default CardButton
