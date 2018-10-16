import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18, MD_ICONS_SIZE_24, MD_ICONS_SIZE_36} from 'universal/styles/icons'

const smallSize = '2rem'
const mediumSize = '2.75rem'
const largeSize = '4rem'

const iconSizes = {
  small: {
    fontSize: MD_ICONS_SIZE_18,
    height: smallSize,
    width: smallSize
  },

  medium: {
    fontSize: MD_ICONS_SIZE_24,
    height: mediumSize,
    width: mediumSize
  },

  large: {
    fontSize: MD_ICONS_SIZE_36,
    height: largeSize,
    width: largeSize
  }
}

const IconAvatarRoot = styled('div')(({size}) => {
  const {fontSize, height, width} = iconSizes[size]
  return {
    alignItems: 'center',
    backgroundColor: appTheme.palette.mid70l,
    borderRadius: '100%',
    color: ui.palette.white,
    display: 'flex',
    fontSize,
    height,
    justifyContent: 'center',
    textAlign: 'center',
    width
  }
})

const StyledIcon = styled(Icon)({
  fontSize: 'inherit'
})

const IconAvatar = ({className, icon, size}) => {
  return (
    <IconAvatarRoot className={className} size={size || 'small'}>
      <StyledIcon>{icon}</StyledIcon>
    </IconAvatarRoot>
  )
}

IconAvatar.propTypes = {
  className: PropTypes.string,
  icon: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
}

export default IconAvatar
