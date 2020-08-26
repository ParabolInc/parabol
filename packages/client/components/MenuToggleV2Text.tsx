import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import Icon from './Icon'

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
const MenuToggleV2Text = forwardRef((props: Props, ref: any) => {
  const {icon, label} = props
  return (
    <MenuToggleInner ref={ref}>
      <GroupIcon>{icon}</GroupIcon>
      <MenuToggleLabel>{label}</MenuToggleLabel>
    </MenuToggleInner>
  )
})

export default MenuToggleV2Text
