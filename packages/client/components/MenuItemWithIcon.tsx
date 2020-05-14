import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '~/styles/paletteV2'
import {ICON_SIZE} from '~/styles/typographyV2'
import Icon from './Icon'

const Wrapper = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingLeft: 8,
  paddingRight: 8,
  width: '100%'
})

const ItemIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD24,
  padding: 8
})

const Label = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  lineHeight: '32px'
})

interface Props {
  icon: string
  label: string
  dataCy: string
}

const MenuItemWithIcon = (props: Props) => {
  const {icon, label, dataCy} = props
  return (
    <Wrapper data-cy={`${dataCy}`}>
      <ItemIcon>{icon}</ItemIcon>
      <Label>{label}</Label>
    </Wrapper>
  )
}

export default MenuItemWithIcon
