import React from 'react'
import styled from '@emotion/styled'
import getColorLuminance from '../utils/getColorLuminance'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import PassSVG from '../../../static/images/icons/no_entry.svg'
import {PokerCards} from '../types/constEnums'

const Card = styled(MiniPokerCardPlaceholder)<{color: string}>(({color}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${getColorLuminance(color, -.12)} 100%)`,
  border: 0,
  color: 'white',
  textShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
}))

const Pass = styled('img')({
  display: 'block',
  height: 16,
  width: 16
})

interface ScaleValue {
  color: string
  label: string
  value: number
}

interface Props {
  scaleValue: ScaleValue
}

const MiniPokerCard = (props: Props) => {
  const {color, label, value} = props.scaleValue
  return (
    <Card color={color}>
      {value === PokerCards.MAX_VALUE ? <Pass src={PassSVG} /> : label}
    </Card>
  )
}

export default MiniPokerCard
