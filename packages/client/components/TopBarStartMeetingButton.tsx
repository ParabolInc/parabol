import styled from '@emotion/styled'
import React from 'react'
import {useLocation} from 'react-router'
import useRouter from '~/hooks/useRouter'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import FlatPrimaryButton from './FlatPrimaryButton'

const Button = styled(FlatPrimaryButton)({
  height: 40,
  overflow: 'hidden',
  paddingLeft: 24,
  paddingRight: 24,
  marginRight: 32
})

const MeetingLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600
})

const TopBarStartMeetingButton = () => {
  const location = useLocation()
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()

  const onClick = () => {
    history.replace(`/new-meeting/${teamId}`, {backgroundLocation: location})
  }
  return (
    <Button onClick={onClick}>
      <MeetingLabel>Add Meeting</MeetingLabel>
    </Button>
  )
}

export default TopBarStartMeetingButton
