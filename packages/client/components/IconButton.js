import PropTypes from 'prop-types'
import React from 'react'
import styled from '@emotion/styled'
import LinkButton from './LinkButton'
import Icon from './Icon'
import {MD_ICONS_SIZE_18, MD_ICONS_SIZE_24} from '../styles/icons'

const StyledButton = styled(LinkButton)({outline: 0})

const StyledIcon = styled(Icon)(({iconLarge}) => ({
  color: 'inherit',
  display: 'block',
  fontSize: iconLarge ? MD_ICONS_SIZE_24 : MD_ICONS_SIZE_18
}))

const IconButton = (props) => {
  const {icon, iconLarge} = props
  return (
    <StyledButton {...props} type='button'>
      <StyledIcon iconLarge={iconLarge}>{icon}</StyledIcon>
    </StyledButton>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string,
  iconLarge: PropTypes.bool
}

export default IconButton
