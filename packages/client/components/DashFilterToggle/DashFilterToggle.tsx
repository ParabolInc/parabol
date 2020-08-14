import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import Icon from '../Icon'
import LinkButton from '../LinkButton'

interface Props {
  label: string
  value: string
  iconText?: string
  onClick: () => void
  onMouseEnter: () => void
}

const StyledIcon = styled(Icon)({
  fontWeight: 400,
  marginRight: 8
})

const StyledLinkButton = styled(LinkButton)({
  color: PALETTE.TEXT_GRAY,
  fontWeight: 600,
  ':hover, :focus, :active': {
    color: PALETTE.TEXT_MAIN
  }
})

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, value, iconText, onClick, onMouseEnter} = props
  return (
    <StyledLinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
    >
      <StyledIcon>{iconText || 'filter_list'}</StyledIcon>
      {value}
    </StyledLinkButton>
  )
})

export default DashFilterToggle
