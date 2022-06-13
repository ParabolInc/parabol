import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'
import MenuItemLabel from './MenuItemLabel'

const ItemIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

const IconWrapper = styled('span')({
  opacity: 0.7,
  height: ICON_SIZE.MD24,
  marginRight: 8
})
interface Props {
  icon: string | React.ReactElement
  label: string
  dataCy: string
}

const MenuItemWithIcon = (props: Props) => {
  const {icon, label, dataCy} = props
  return (
    <MenuItemLabel data-cy={dataCy}>
      {typeof icon === 'string' ? <ItemIcon>{icon}</ItemIcon> : <IconWrapper>{icon}</IconWrapper>}
      <span>{label}</span>
    </MenuItemLabel>
  )
}

export default MenuItemWithIcon
