import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import React from 'react'
import BottomNavIconLabel, {paletteColors} from './BottomNavIconLabel'

interface Props {
  icon?: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  shouldAnimate?: boolean
}

const shake = keyframes`
  0% {
    transform: rotate(10deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(20deg);
  }
  75% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
`

const BottomButton = styled(BottomNavIconLabel)<{shouldAnimate?: boolean}>(({shouldAnimate}) => {
  if (!shouldAnimate) return

  return {
    background: '#a06bd6',
    color: 'white',
    animation: `${shake} 1s ease-in-out 2s 3`
  }
})

const BottomNavHelpButton = (props: Props) => {
  const {icon, iconColor, label, shouldAnimate} = props
  return (
    <BottomButton
      label={label}
      shouldAnimate={shouldAnimate}
      icon={icon}
      iconColor={!shouldAnimate ? iconColor : undefined}
    />
  )
}

export default BottomNavHelpButton
