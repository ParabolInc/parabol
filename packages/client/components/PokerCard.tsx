import styled from '@emotion/styled'
import React from 'react'
import logoMarkWhite from '../styles/theme/images/brand/mark-white.svg'
import {BezierCurve} from '../types/constEnums'


const colorLuminance = (rawHex: string, lum: number) => {
  const hex = rawHex.slice(1)
  let rgb = "#"
  for (let i = 0; i < 3; i++) {
    const partial = parseInt(hex.substr(i * 2, 2), 16)
    const color = Math.round(Math.min(Math.max(0, partial + (partial * lum)), 255)).toString(16)
    rgb += ("00" + color).substr(color.length)
  }
  return rgb
}

const getYPos = (isSelected: boolean, totalCards: number, idx: number) => {
  if (isSelected) return -48
  const totalSteps = Math.floor(totalCards / 2)
  const stepIdx = idx <= totalSteps ? idx : totalSteps - (idx - totalSteps)
  const STEP_VAL = -4
  return STEP_VAL * stepIdx
}
const CardBase = styled('div')<{color: string, idx: number, isSelected: boolean, totalCards: number}>(({color, idx, isSelected, totalCards}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${colorLuminance(color, -.12)} 100%)`,
  borderRadius: 6,
  display: 'flex',
  height: 175,
  justifyContent: 'center',
  position: 'relative',
  transform: `translate(${-96 * idx}px, ${getYPos(isSelected, totalCards, idx)}px)`,
  transition: `transform 100ms ${BezierCurve.DECELERATE}`,
  width: 125
}))

const UpperLeftCardValue = styled('div')({
  color: '#fff',
  textShadow: '0px 1px 1px rgba(0,0,0,0.05)',
  fontSize: 20,
  fontWeight: 600,
  position: 'absolute',
  top: 4,
  left: 8
})

const Logo = styled('img')({
  // set min & max to accomodate custom logos here
  minWidth: 64,
  maxWidth: 96,
  opacity: 0.5

})
interface Props {
  card: any
  idx: number
  isSelected: boolean
  onClick: () => void
  totalCards: number
}

const PokerCard = (props: Props) => {
  const {card, idx, isSelected, onClick, totalCards} = props
  const {color, label} = card
  return (
    <CardBase color={color} idx={idx} isSelected={isSelected} totalCards={totalCards} onClick={onClick}>
      <UpperLeftCardValue>{label}</UpperLeftCardValue>
      <Logo src={logoMarkWhite} />
    </CardBase>
  )
}

export default PokerCard
