import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import {meetingAvatarMediaQueries} from '../../styles/meeting'
import BackButton from '../BackButton'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import TeamPromptOptions from './TeamPromptOptions'

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0
})

const TeamPromptHeader = styled('div')({
  margin: 'auto 0',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start'
})

const ButtonContainer = styled('div')({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  height: 32,
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    marginLeft: 10
  },
  [meetingAvatarMediaQueries[1]]: {
    height: 56
  }
})

interface Props {
  meetingRef: TeamPromptTopBar_meeting$key
}

const TeamPromptTopBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptTopBar_meeting on TeamPromptMeeting {
        name
        ...TeamPromptOptions_meeting
        ...NewMeetingAvatarGroup_meeting
      }
    `,
    meetingRef
  )

  const {name: meetingName} = meeting

  return (
    <MeetingTopBarStyles>
      <TeamPromptHeader>
        <BackButton ariaLabel='Back to Meetings' to='/meetings' />
        <TeamPromptHeaderTitle>{meetingName}</TeamPromptHeaderTitle>
      </TeamPromptHeader>
      <IconGroupBlock>
        <NewMeetingAvatarGroup meeting={meeting} />
        <ButtonContainer>
          <TeamPromptOptions meetingRef={meeting} />
        </ButtonContainer>
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
