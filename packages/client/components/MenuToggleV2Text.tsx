import styled from '@emotion/styled'
import React, {forwardRef} from 'react'
import {PALETTE} from '~/styles/paletteV3'

const MenuToggleInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  minWidth: 0
})

const AdornmentContainer = styled('div')({
  marginRight: 16
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
  startAdornment?: React.ReactElement
  title: string
}
const MenuToggleV2Text = forwardRef((props: Props, ref: any) => {
  const {startAdornment, label, title} = props
  return (
    <MenuToggleInner ref={ref}>
      {startAdornment && <AdornmentContainer>{startAdornment}</AdornmentContainer>}
      <div>
        <MenuToggleTitle>{title}</MenuToggleTitle>
        <MenuToggleLabel>{label}</MenuToggleLabel>
      </div>
    </MenuToggleInner>
  )
})

export default MenuToggleV2Text
