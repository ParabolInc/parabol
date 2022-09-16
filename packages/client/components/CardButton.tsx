import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
import {Card} from '../types/constEnums'
import BaseButton from './BaseButton'

const buttonSize = Card.BUTTON_HEIGHT

const CardButton = styled(BaseButton)({
  alignItems: 'center',
  borderRadius: buttonSize,
  color: PALETTE.SLATE_700,
  display: 'flex',
  height: buttonSize,
  justifyContent: 'center',
  lineHeight: Card.LINE_HEIGHT,
  minWidth: buttonSize,
  opacity: 0.5,
  outline: 0,
  padding: 0,
  ':hover, :focus': {
    backgroundColor: PALETTE.SLATE_200,
    opacity: 1
  }
})

export default CardButton
