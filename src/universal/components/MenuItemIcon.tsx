import React from 'react'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import {PALETTE} from '../styles/paletteV2'

interface Props {
  iconColor?: string
  icon?: string
}

const StyledIcon = styled(Icon)(({iconColor}: {iconColor?: string}) => ({
  color: iconColor || PALETTE.TEXT.LIGHT,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8
}))

const MenuItemIcon = (props: Props) => {
  const {iconColor, icon} = props
  return <StyledIcon iconColor={iconColor}>{icon}</StyledIcon>
}

export default MenuItemIcon
