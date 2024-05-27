import styled from '@emotion/styled'
import React, {ReactNode, useRef} from 'react'
import useResizeFontForElement from '~/hooks/useResizeFontForElement'
import {PALETTE} from '~/styles/paletteV3'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import {Elevation} from '../styles/elevation'
import {PokerCards} from '../types/constEnums'
import getPokerCardBackground from '../utils/getPokerCardBackground'

const MiniPokerCardPlaceholder = styled('div')<{
  canEdit?: boolean
  color?: string
  onClick?: () => void
  isFinal?: boolean
}>(({canEdit, color, onClick, isFinal}) => ({
  alignItems: 'center',
  background: color ? getPokerCardBackground(color) : '#fff',
  border: color
    ? 0
    : isFinal
      ? `1px solid ${PALETTE.SLATE_400}`
      : `1px dashed ${PALETTE.SLATE_600}`,
  borderRadius: 2,
  color: color ? '#fff' : PALETTE.SLATE_600,
  cursor: onClick || canEdit ? 'pointer' : 'default',
  display: 'flex',
  flexShrink: 0,
  fontWeight: 600,
  height: 40,
  fontSize: 14,
  justifyContent: 'center',
  lineHeight: '24px',
  textAlign: 'center',
  textShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)',
  textOverflow: 'ellipsis',
  transition: onClick ? 'all 200ms' : 'none',
  userSelect: 'none',
  width: 28,
  ':hover': {
    boxShadow: onClick || canEdit ? Elevation.Z3 : 'none'
  }
}))

const Pass = styled('img')({
  display: 'block',
  height: 16,
  userSelect: 'none',
  width: 16
})

interface Props {
  canEdit?: boolean
  color?: string
  children: ReactNode
  isFinal?: boolean
  onClick?: () => void
}

const MiniPokerCard = (props: Props) => {
  const {canEdit, color, children, onClick, isFinal} = props

  const labelRef = useRef<HTMLDivElement>(null)
  if (typeof children === 'string') {
    useResizeFontForElement(labelRef, children, 10, 18, 1)
  }
  return (
    <MiniPokerCardPlaceholder
      ref={labelRef}
      canEdit={canEdit}
      color={color}
      onClick={onClick}
      isFinal={isFinal}
    >
      {children === PokerCards.PASS_CARD ? <Pass src={PassSVG} /> : children}
    </MiniPokerCardPlaceholder>
  )
}

export default MiniPokerCard
