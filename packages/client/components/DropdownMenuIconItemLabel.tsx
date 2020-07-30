import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'

const Label = styled('span')({
  alignItems: 'center',
  color: PALETTE.TEXT_MAIN,
  display: 'flex',
  fontSize: 15,
  lineHeight: '32px',
  padding: `0 12px`,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  paddingRight: 12
})

interface Props {
  icon: string
  label: string
}

const DropdownMenuIconItemLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <Label>
      <StyledIcon>{icon}</StyledIcon>
      {label}
    </Label>
  )
}
export default DropdownMenuIconItemLabel
