import styled from '@emotion/styled'
import React, {forwardRef, Ref} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import Icon from '../Icon'
import LinkButton from '../LinkButton'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {Breakpoint} from '~/types/constEnums'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

interface Props {
  label: string
  value: string
  iconText?: string
  dataCy?: string
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
  marginRight: '16px',
  ':hover, :focus, :active': {
    color: PALETTE.TEXT_MAIN
  },
  [desktopBreakpoint]: {
    marginRight: '24px',
  }
})

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {label, value, iconText, onClick, onMouseEnter, dataCy} = props
  return (
    <StyledLinkButton
      aria-label={`Filter by ${label}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
      dataCy={dataCy}
    >
      <StyledIcon>{iconText || 'filter_list'}</StyledIcon>
      {value}
    </StyledLinkButton>
  )
})

export default DashFilterToggle
