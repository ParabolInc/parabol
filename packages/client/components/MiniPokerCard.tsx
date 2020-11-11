import React from 'react'
import styled from '@emotion/styled'
import getColorLuminance from '../utils/getColorLuminance'
import MiniPokerCardPlaceholder from './MiniPokerCardPlaceholder'
import PassSVG from '../../../static/images/icons/no_entry.svg'

const Card = styled(MiniPokerCardPlaceholder)<{color: string}>(({color}) => ({
  background: `radial-gradient(50% 50% at 50% 50%, ${color} 0%, ${getColorLuminance(color, -.12)} 100%)`,
  border: 0,
  // boxShadow: `
  //   0px 0px 2px rgba(68, 66, 88, 0.28),
  //   0px 2px 2px rgba(68, 66, 88, 0.24),
  //   0px 1px 3px rgba(68, 66, 88, 0.4)`,
  color: 'white',
  textShadow: '0px 1px 1px rgba(0, 0, 0, 0.1)'
}))

const Pass = styled('img')({
  display: 'block',
  height: 16,
  width: 16
})

const MAX_32_BIT_INTEGER = Math.pow(2, 31) - 1

interface Props {
  scaleValue: any
}

const MiniPokerCard = (props: Props) => {
  const {color, label, value} = props.scaleValue
  // Todo PassSVG could use a little drop shadow like the label
  return (
    <Card color={color}>
      {value === MAX_32_BIT_INTEGER ? <Pass src={PassSVG} /> : label}
    </Card>
  )
}

export default MiniPokerCard
