import styled from '@emotion/styled'
import UnfoldLess from '@mui/icons-material/UnfoldLess'
import UnfoldMore from '@mui/icons-material/UnfoldMore'
import React, {ReactNode} from 'react'
import {PALETTE} from '../styles/paletteV3'

const DropdownIcon = styled('div')({
  padding: '8px 0 8px 4px'
})

const Label = styled('div')({
  alignItems: 'center',
  color: PALETTE.SKY_500,
  cursor: 'pointer',
  display: 'flex',
  fontSize: 14,
  fontWeight: 600,
  justifyContent: 'center',
  ':hover': {
    color: PALETTE.SKY_600
  }
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
      <DropdownIcon>{isExpanded ? <UnfoldLess /> : <UnfoldMore />}</DropdownIcon>
    </Label>
  )
}

export default ExpansionPanelSummary
