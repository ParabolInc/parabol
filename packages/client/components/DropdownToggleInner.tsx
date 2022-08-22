import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'

const Container = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0
})

const IconContainer = styled('div')({
  marginRight: 16
})

const MenuToggleLabelContainer = styled('div')({
  // Squeeze in an extra 1% to fit the largest public template "Always Be Learning Retrospective 🌱"
  maxWidth: '101%'
})

const MenuToggleLabel = styled('div')({
  flex: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: 20,
  fontWeight: 600,
  color: PALETTE.SLATE_900
})

const MenuToggleTitle = styled('div')({
  fontSize: 14,
  lineHeight: '16px',
  fontWeight: 400,
  color: PALETTE.SLATE_900
})

interface Props {
  label: string
  icon?: React.ReactElement
  title: string
}
const DropdownToggleInner = forwardRef((props: Props, ref: any) => {
  const {icon, label, title} = props
  return (
    <Container ref={ref}>
      {icon && <IconContainer>{icon}</IconContainer>}
      <MenuToggleLabelContainer>
        <MenuToggleTitle>{title}</MenuToggleTitle>
        <MenuToggleLabel>{label}</MenuToggleLabel>
      </MenuToggleLabelContainer>
    </Container>
  )
})

export default DropdownToggleInner
