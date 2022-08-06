import styled from '@emotion/styled'
import React from 'react'
import {useLocation} from 'react-router'
import useRouter from '~/hooks/useRouter'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import {BezierCurve} from '../types/constEnums'
import FlatPrimaryButton from './FlatPrimaryButton'
import Icon from './Icon'

const Button = styled(FlatPrimaryButton)<{isOpen: boolean}>(({isOpen}) => ({
  height: 40,
  overflow: 'hidden',
  paddingLeft: isOpen ? 2 : 3,
  paddingRight: isOpen ? 2 : 3,
  width: isOpen ? 145 : 40,
  marginLeft: 10,
  marginTop: 15,
  marginBottom: 15,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  justifyContent: 'flex-start'
}))

const MeetingIcon = styled(Icon)<{isOpen: boolean}>(({isOpen}) => ({
  marginLeft: isOpen ? 2 : 4,
  marginRight: isOpen ? 5 : 4,
  transition: `all 300ms ${BezierCurve.DECELERATE}`
}))

const MeetingLabel = styled('div')<{isOpen: boolean}>(({isOpen}) => ({
  fontSize: 16,
  fontWeight: 600,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  opacity: isOpen ? 1 : 0
}))

const SideBarStartMeetingButton = ({isOpen}: {isOpen: boolean}) => {
  const location = useLocation()
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()

  const onClick = () => {
    history.replace(`/new-meeting/${teamId}`, {backgroundLocation: location})
  }
  return (
    <Button isOpen={isOpen} onClick={onClick}>
      <MeetingIcon isOpen={isOpen}>{'add'}</MeetingIcon>
      <MeetingLabel isOpen={isOpen}>Add Meeting</MeetingLabel>
    </Button>
  )
}

export default SideBarStartMeetingButton
