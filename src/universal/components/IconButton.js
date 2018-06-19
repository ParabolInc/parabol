import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import LinkButton from 'universal/components/LinkButton'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import ui from 'universal/styles/ui'

const StyledButton = styled(LinkButton)({outline: 0})

const StyledIcon = styled(StyledFontAwesome)(({iconLarge}) => ({
  color: 'inherit',
  fontSize: iconLarge ? ui.iconSize2x : ui.iconSize
}))

const IconButton = (props) => {
  const {icon, iconLarge} = props
  return (
    <StyledButton {...props} type='button'>
      <StyledIcon name={icon} iconLarge={iconLarge} />
    </StyledButton>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string,
  iconLarge: PropTypes.bool
}

export default IconButton
