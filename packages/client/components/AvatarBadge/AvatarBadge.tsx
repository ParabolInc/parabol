import React from 'react'
import {PALETTE} from '../../styles/paletteV2'
import srOnly from '../../styles/helpers/srOnly'
import styled from '@emotion/styled'
import Icon from 'components/Icon'
import {ICON_SIZE} from 'styles/typographyV2'

const checkInStatus = [
  {
    icon: 'brightness_1',
    statusName: ''
  },
  {
    icon: 'check_circle',
    statusName: ' & present'
  },
  {
    icon: 'remove_circle',
    statusName: ' & absent'
  }
]

const Badge = styled('div')({
  display: 'block',
  fontSize: 16,
  height: 16,
  lineHeight: 1,
  position: 'relative',
  textAlign: 'center',
  width: 16,

  '::before': {
    backgroundColor: '#FFFFFF',
    borderRadius: '100%',
    content: '""',
    height: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 16,
    zIndex: 300
  },

  '::after': {
    backgroundColor: 'rgba(255, 255, 255, .65)',
    borderRadius: '100%',
    content: '""',
    height: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 16,
    zIndex: 200
  }
})

const BadgeIcon = styled(Icon)<Pick<Props, 'isConnected'>>(({isConnected}) => ({
  color: isConnected ? PALETTE.TEXT_GREEN : PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18,
  height: '1em',
  left: '-1px',
  top: '-1px',
  lineHeight: '1em',
  position: 'absolute',
  width: '1em',
  zIndex: 400
}))

const Description = styled('div')({
  ...srOnly
})

interface Props {
  isCheckedIn: boolean | null | undefined
  isConnected: boolean
}

const AvatarBadge = (props: Props) => {
  const {isCheckedIn = null, isConnected} = props
  const connection = isConnected ? 'online' : 'offline'
  const checkIn = isCheckedIn ? 'present' : 'absent'
  const {icon, statusName} = isCheckedIn === null ? checkInStatus[0] : isCheckedIn === true ? checkInStatus[1] : checkInStatus[2]
  const title = `${isConnected ? 'Online' : 'Offline'}${statusName}`
  const description = `${connection}, ${checkIn}`
  return (
    <Badge>
      <BadgeIcon isConnected={isConnected as boolean} title={title as string}>{icon as any}</BadgeIcon>
      <Description>{description}</Description>
    </Badge>
  )
}

export default AvatarBadge
