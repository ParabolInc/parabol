import styled from '@emotion/styled'
import React from 'react'


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

const CardBase = styled('div')<{color: string}>(({color}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${colorLuminance(color, -.12)} 100%)`,
  borderRadius: 6,
  height: 175,
  width: 125

}))

interface Props {
  card: any
}

const PokerCard = (props: Props) => {
  const {card} = props
  const {color} = card
  return (
    <CardBase color={color}>

    </CardBase>
  )
}

export default PokerCard
