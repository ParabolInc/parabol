import React, {forwardRef} from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {meetingBottomBarHeight} from 'universal/styles/meeting'
import ui from 'universal/styles/ui'

interface Props {
  innerRef?: any
  className?: string
  icon: string | undefined
  iconColor: string | undefined
  label: any | undefined
}

const Inner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  height: meetingBottomBarHeight,
  padding: '.5rem .75rem .25rem'
})

const StyledIcon = styled(Icon)(({iconColor}: {iconColor?: string}) => ({
  color: iconColor ? ui.palette[iconColor] : 'inherit'
}))

const Label = styled('div')({
  color: 'inherit',
  fontSize: 12,
  height: 16,
  lineHeight: '16px'
})

const BottomNavIconLabel = forwardRef((props: Props, ref: any) => {
  const {className, icon, iconColor, label} = props
  return (
    <Inner className={className} innerRef={ref}>
      <StyledIcon iconColor={iconColor}>{icon}</StyledIcon>
      <Label>{label}</Label>
    </Inner>
  )
})

export default BottomNavIconLabel
