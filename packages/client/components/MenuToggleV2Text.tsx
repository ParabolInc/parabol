import styled from '@emotion/styled'
import Icon from './Icon'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0
})

const GroupIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  paddingLeft: 12,
  paddingRight: 12
})

const MenuToggleLabel = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
})

interface Props {
  label: string
  icon: string
}
const MenuToggleV2Text = (props: Props) => {
  const {icon, label} = props
  return (
    <MenuToggleInner>
      <GroupIcon>{icon}</GroupIcon>
      <MenuToggleLabel>{label}</MenuToggleLabel>
    </MenuToggleInner>
  )
}

export default MenuToggleV2Text
