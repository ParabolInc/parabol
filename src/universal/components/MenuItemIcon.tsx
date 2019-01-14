import React from 'react'
import ui from 'universal/styles/ui'
import styled from 'react-emotion'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

interface Props {
  iconColor?: string
  icon?: string
}

const StyledIcon = styled(Icon)(({iconColor}: {iconColor: string}) => ({
  color: iconColor || ui.menuItemIconColor,
  fontSize: `${MD_ICONS_SIZE_18} !important`,
  lineHeight: 'inherit',
  marginLeft: ui.menuGutterHorizontal,
  marginRight: ui.menuGutterInner,
  textAlign: 'center',
  width: '1.25rem'
}))

const MenuItemIcon = (props: Props) => {
  const {iconColor, icon} = props
  return <StyledIcon iconColor={iconColor}>{icon}</StyledIcon>
}

export default MenuItemIcon
