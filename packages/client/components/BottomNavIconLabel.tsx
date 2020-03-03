import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'

const paletteColors = {
  warm: PALETTE.EMPHASIS_WARM,
  midGray: PALETTE.TEXT_GRAY,
  red: PALETTE.TEXT_RED,
  green: PALETTE.TEXT_GREEN,
  blue: PALETTE.TEXT_BLUE
}

interface Props {
  className?: string
  icon: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  bottomIcon?: string
}

const Inner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 8px 4px'
})

const StyledIcon = styled(Icon)<{iconColor?: string}>(({iconColor}) => ({
  color: iconColor ? paletteColors[iconColor] : 'inherit'
}))

const Label = styled('div')({
  color: 'inherit',
  fontSize: 12,
  height: 16,
  lineHeight: '16px'
})

const BottomNavIconLabel = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {className, icon, iconColor, label, bottomIcon} = props
  return (
    <Inner data-cy={bottomIcon} className={className} ref={ref}>
      <StyledIcon  iconColor={iconColor}>{icon}</StyledIcon>
      <Label>{label}</Label>
    </Inner>
  )
})

export default BottomNavIconLabel
