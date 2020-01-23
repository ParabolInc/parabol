import React, {forwardRef, Ref} from 'react'
import styled from '@emotion/styled'
import LinkButton from '../LinkButton'
import Icon from '../Icon'
import {PALETTE} from 'styles/paletteV2'

interface Props {
  label: string
  value: string
  onClick: () => void
  onMouseEnter: () => void
}

const StyledIcon = styled(Icon)({
  marginRight: 8
})

const StyledLinkButton = styled(LinkButton)({
  '&:hover, &:focus, &:active': {
    color: PALETTE.TEXT_GRAY
  }
})

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, value, onClick, onMouseEnter} = props
  return (
    <StyledLinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
    >
      <StyledIcon>filter_list</StyledIcon>
      {value}
    </StyledLinkButton>
  )
})

export default DashFilterToggle
