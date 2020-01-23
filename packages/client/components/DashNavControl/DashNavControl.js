import PropTypes from 'prop-types'
import React from 'react'
import LinkButton from '../LinkButton'
import IconLabel from '../IconLabel'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'

const StyledLinkButton = styled(LinkButton)({
  '&:hover, &:focus, &:active': {
    color: PALETTE.TEXT_GRAY
  }
})

const DashNavControl = (props) => {
  const {icon, label, onClick} = props
  return (
    <StyledLinkButton aria-label={label} onClick={onClick}>
      <IconLabel icon={icon} iconLarge label={label} />
    </StyledLinkButton>
  )
}

DashNavControl.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func
}

export default DashNavControl
