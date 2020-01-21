import styled from '@emotion/styled'
import useRouter from 'hooks/useRouter'
import React from 'react'
import {PALETTE} from 'styles/paletteV2'
import getTeamIdFromPathname from 'utils/getTeamIdFromPathname'
import {ZIndex} from '../types/constEnums'
import FloatingActionButton from './FloatingActionButton'
import Icon from './Icon'

const Block = styled('div')({
  position: 'fixed',
  left: 0,
  bottom: 16,
  width: '100%',
  maxWidth: 1800,
  display: 'flex',
  justifyContent: 'flex-end',
  // hacky, but we need the FAB to show up over the team right nav
  zIndex: ZIndex.SIDE_SHEET
})

const Button = styled(FloatingActionButton)({
  color: '#fff',
  backgroundImage: PALETTE.GRADIENT_WARM,
  height: 56,
  marginRight: 16,
  padding: 0,
  overflow: 'hidden',
  zIndex: ZIndex.FAB
})

const MeetingIcon = styled(Icon)({
  padding: 16,
  paddingLeft: 24,
  paddingRight: 16
})

const MeetingLabel = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  textAlign: 'start',
  width: 158
})

interface Props {}

const StartMeetingFAB = (props: Props) => {
  const {} = props
  const teamId = getTeamIdFromPathname()
  const {history} = useRouter()
  const onClick = () => {
    history.push(`/new-meeting/${teamId}`)
  }
  return (
    <Block>
      <Button onClick={onClick}>
        <MeetingIcon>{'forum'}</MeetingIcon>
        <MeetingLabel>{'Start New Meeting'}</MeetingLabel>
      </Button>
    </Block>
  )
}

export default StartMeetingFAB
