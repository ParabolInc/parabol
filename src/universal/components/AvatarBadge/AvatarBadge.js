import PropTypes from 'prop-types'
import React from 'react'
import appTheme from 'universal/styles/theme/appTheme'
import srOnly from 'universal/styles/helpers/srOnly'
import styled from 'react-emotion'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'

const checkInStatus = {
  null: {
    icon: 'circle',
    statusName: ''
  },
  true: {
    icon: 'check-circle',
    statusName: ' & present'
  },
  false: {
    icon: 'minus-circle',
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

const BadgeIcon = styled(StyledFontAwesome)(({isConnected}) => ({
  color: isConnected ? appTheme.brand.secondary.green : appTheme.palette.dark50l,
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
      <BadgeIcon isConnected={isConnected} name={icon} title={title} />
      <Description>{description}</Description>
    </Badge>
  )
}

AvatarBadge.propTypes = {
  isCheckedIn: PropTypes.bool,
  isConnected: PropTypes.bool
}

export default AvatarBadge
