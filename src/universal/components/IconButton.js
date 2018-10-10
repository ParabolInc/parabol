import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import LinkButton from 'universal/components/LinkButton'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18, MD_ICONS_SIZE_24} from 'universal/styles/icons'

const StyledButton = styled(LinkButton)({outline: 0})

const StyledIcon = styled(Icon)(({iconLarge}) => ({
  color: 'inherit',
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
