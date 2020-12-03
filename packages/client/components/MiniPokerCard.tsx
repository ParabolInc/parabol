import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import {PokerCards} from '../types/constEnums'
import getPokerCardBackground from '../utils/getPokerCardBackground'

const MiniPokerCardPlaceholder = styled('div')<{color?: string, onClick?: () => void, isFinal?: boolean}>(({color, onClick, isFinal}) => ({
  alignItems: 'center',
  background: color ? getPokerCardBackground(color) : '#fff',
  border: color ? 0 : isFinal ? `1px solid ${PALETTE.TEXT_GRAY}` : `1px dashed ${PALETTE.TEXT_GRAY}`,
  borderRadius: 2,
  color: color ? '#fff' : PALETTE.TEXT_GRAY,
  cursor: onClick ? 'pointer' : 'default',
  display: 'flex',
  flexShrink: 0,
  fontWeight: 600,
  height: 40,
  fontSize: 18,
  justifyContent: 'center',
  lineHeight: '24px',
  textAlign: 'center',
  textShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
  userSelect: 'none',
  width: 28
}))

const Pass = styled('img')({
  display: 'block',
  height: 16,
  userSelect: 'none',
  width: 16
})

interface Props {
  color?: string
  children: ReactNode
  isFinal?: boolean
  onClick?: () => void
}

const MiniPokerCard = (props: Props) => {
  const {color, children, onClick, isFinal} = props
  return (
    <MiniPokerCardPlaceholder color={color} onClick={onClick} isFinal={isFinal}>
      {children === PokerCards.PASS_CARD ? <Pass src={PassSVG} /> : children}
    </MiniPokerCardPlaceholder>
  )
}

export default MiniPokerCard
