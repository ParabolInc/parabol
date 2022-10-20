import styled from '@emotion/styled'
import {Event, HelpOutline, PersonPinCircleOutlined, TimerOutlined} from '@mui/icons-material'
import React, {forwardRef, ReactNode, Ref} from 'react'
import {PALETTE} from '../styles/paletteV3'

const paletteColors = {
  warm: PALETTE.ROSE_500,
  midGray: PALETTE.SLATE_600,
  red: PALETTE.TOMATO_600,
  green: PALETTE.JADE_400,
  blue: PALETTE.SKY_500
}

interface Props {
  className?: string
  fontSize?: number
  //FIXME 6062: change to React.ComponentType
  icon?: string | undefined
  iconColor?: keyof typeof paletteColors
  label: any | undefined
  children?: ReactNode
}

const StyledIcon = styled('div')<{iconColor?: keyof typeof paletteColors}>(({iconColor}) => ({
  color: iconColor ? paletteColors[iconColor] : 'inherit',
  height: 24,
  width: 24
}))

const Inner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: '8px 8px 4px'
})

const Label = styled('div')({
  color: 'inherit',
  fontSize: 12,
  height: 16,
  lineHeight: '16px'
})

const BottomNavIconLabel = forwardRef((props: Props, ref: Ref<HTMLDivElement>) => {
  const {children, className, icon, iconColor, label} = props

  return (
    <Inner className={className} ref={ref}>
      {children || (
        <StyledIcon iconColor={iconColor}>
          {
            {
              help_outline: <HelpOutline />,
              timer: <TimerOutlined />,
              event: <Event />,
              person_pin_circle: <PersonPinCircleOutlined />
            }[icon!]
          }
        </StyledIcon>
      )}
      <Label>{label}</Label>
    </Inner>
  )
})

export default BottomNavIconLabel
