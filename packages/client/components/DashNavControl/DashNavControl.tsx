import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import IconLabel from '../IconLabel'
import LinkButton from '../LinkButton'

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.SLATE_600,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.SLATE_700
  }
})

interface Props {
  icon: string
  label: string
  onClick: () => void
}

const DashNavControl = (props: Props) => {
  const {icon, label, onClick} = props
  return (
    <StyledLinkButton aria-label={label} onClick={onClick}>
      <IconLabel icon={icon} iconLarge label={label} />
    </StyledLinkButton>
  )
}

export default DashNavControl
