import styled from '@emotion/styled'
import React from 'react'
import {useLocation} from 'react-router'
import useRouter from '~/hooks/useRouter'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import {BezierCurve} from '../types/constEnums'
import FlatPrimaryButton from './FlatPrimaryButton'
import Icon from './Icon'

const Button = styled(FlatPrimaryButton)<{isOpen: boolean}>(({isOpen}) => ({
  height: 50,
  overflow: 'hidden',
  padding: 0,
  width: isOpen ? 160 : 50,
  marginLeft: 7,
  marginTop: 15,
  marginBottom: 15,
  transition: `all 300ms ${BezierCurve.DECELERATE}`,
  justifyContent: 'flex-start'
}))

const MeetingIcon = styled(Icon)({
  margin: '0px 12px',
  transition: `all 300ms ${BezierCurve.DECELERATE}`
})

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
      <MeetingIcon>{'add'}</MeetingIcon>
      <MeetingLabel isOpen={isOpen}>Add Meeting</MeetingLabel>
    </Button>
  )
}

export default SideBarStartMeetingButton
