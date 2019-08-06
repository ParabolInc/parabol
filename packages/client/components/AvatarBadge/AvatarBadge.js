import PropTypes from 'prop-types'
import React from 'react'
import appTheme from '../../styles/theme/appTheme'
import srOnly from '../../styles/helpers/srOnly'
import styled from '@emotion/styled'
import Icon from 'components/Icon'
import {MD_ICONS_SIZE_18} from 'styles/icons'

const checkInStatus = {
  null: {
    icon: 'brightness_1',
    statusName: ''
  },
  true: {
    icon: 'check_circle',
    statusName: ' & present'
  },
  false: {
    icon: 'remove_circle',
    statusName: ' & absent'
  }
}

const Badge = styled('div')({
  display: 'block',
  fontSize: '.875rem',
  height: '.875rem',
  lineHeight: '.875rem',
  textAlign: 'center',

  '::before': {
    backgroundColor: '#fff',
    borderRadius: '100%',
    content: '""',
    height: '.75rem',
    position: 'absolute',
    right: '1px',
    top: '1px',
    width: '.75rem',
    zIndex: 300
  },

  '::after': {
    backgroundColor: 'rgba(255, 255, 255, .65)',
    borderRadius: '100%',
    content: '""',
    height: '1em',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '1em',
    zIndex: 200
  }
})

const BadgeIcon = styled(Icon)(({isConnected}) => ({
  color: isConnected ? appTheme.brand.secondary.green : appTheme.palette.dark50l,
  fontSize: MD_ICONS_SIZE_18,
  height: '1em',
  lineHeight: '1em',
  position: 'relative',
  width: '1em',
  zIndex: 400
}))

const Description = styled('div')({
  ...srOnly
})

const AvatarBadge = (props) => {
  const {isCheckedIn = null, isConnected} = props
  const connection = isConnected ? 'online' : 'offline'
  const checkIn = isCheckedIn ? 'present' : 'absent'
  const {icon, statusName} = checkInStatus[isCheckedIn]
  const title = `${isConnected ? 'Online' : 'Offline'}${statusName}`
  const description = `${connection}, ${checkIn}`
  return (
    <Badge>
      <BadgeIcon isConnected={isConnected} title={title}>{icon}</BadgeIcon>
      <Description>{description}</Description>
    </Badge>
  )
}

AvatarBadge.propTypes = {
  isCheckedIn: PropTypes.bool,
  isConnected: PropTypes.bool
}

export default AvatarBadge
