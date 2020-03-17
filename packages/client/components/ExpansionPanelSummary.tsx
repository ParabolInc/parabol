import React, {ReactNode} from 'react'
import styled from '@emotion/styled'
import Icon from './Icon'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'

const DropdownIcon = styled(Icon)({
  padding: 12,
  fontSize: ICON_SIZE.MD24
})

const Label = styled('div')({
  alignItems: 'center',
  color: PALETTE.LINK_BLUE,
  cursor: 'pointer',
  display: 'flex',
  fontWeight: 600,
  justifyContent: 'center'
})

interface Props {
  isExpanded: boolean
  onClick: () => void
  label: ReactNode
}

const ExpansionPanelSummary = (props: Props) => {
  const {label, onClick, isExpanded} = props
  return (
    <Label onClick={onClick}>
      {label}
      <DropdownIcon>{isExpanded ? 'expand_less' : 'expand_more'}</DropdownIcon>
    </Label>
  )
}

export default ExpansionPanelSummary
