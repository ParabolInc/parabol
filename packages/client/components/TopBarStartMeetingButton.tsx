import styled from '@emotion/styled'
import React from 'react'
import useRouter from '~/hooks/useRouter'
import {PALETTE} from '~/styles/paletteV3'
import getTeamIdFromPathname from '~/utils/getTeamIdFromPathname'
import FloatingActionButton from './FloatingActionButton'

const Button = styled(FloatingActionButton)({
  color: '#fff',
  backgroundImage: PALETTE.GRADIENT_TOMATO_600_ROSE_500,
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
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()

  const onClick = () => {
    history.push(`/new-meeting/${teamId}?source=TopBar`)
  }
  return (
    <Button onClick={onClick}>
      <MeetingLabel>Start Meeting</MeetingLabel>
    </Button>
  )
}

export default TopBarStartMeetingButton
