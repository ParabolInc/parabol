import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const LabelBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
})

const Label = styled('div')<Pick<Props, 'iconAfter' | 'iconLarge'>>(({iconAfter, iconLarge}) => {
  const gutter = iconLarge ? '12px' : '8px'
  return {
    color: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    margin: iconAfter ? `0 ${gutter} 0 0` : `0 0 0 ${gutter}`,
    whiteSpace: 'nowrap'
  }
})

const StyledIcon = styled(Icon)<Pick<Props, 'iconAfter' | 'iconColor' | 'iconLarge'>>(({iconAfter, iconColor, iconLarge}) => ({
  color: iconColor ? ui.palette[iconColor] : 'inherit',
  display: 'block',
  fontSize: iconLarge ? ICON_SIZE.MD24 : ICON_SIZE.MD18,
  order: iconAfter ? 2 : undefined
}))

interface Props {
  icon: string
  iconAfter?: boolean
  iconColor?: string
  iconLarge?: boolean
  label?: ReactNode
}

const IconLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <LabelBlock>
      <StyledIcon {...props}>{icon}</StyledIcon>
      {label && <Label {...props}>{label}</Label>}
    </LabelBlock>
  )
}

export default IconLabel
