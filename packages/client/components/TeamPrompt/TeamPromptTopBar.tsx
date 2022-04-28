import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import {meetingAvatarMediaQueries} from '../../styles/meeting'
import BackButton from '../BackButton'
import {HeadingBlock, IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import TeamPromptOptions from './TeamPromptOptions'

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0
})

const TeamPromptHeader = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start'
})

const ButtonContainer = styled('div')({
  alignItems: 'center',
  alignContent: 'center',
  display: 'flex',
  height: 32,
  marginLeft: 11,
  position: 'relative',
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
      }
    `,
    meetingRef
  )

  const {name: meetingName} = meeting

  return (
    <MeetingTopBarStyles>
      <HeadingBlock>
        <TeamPromptHeader>
          <BackButton ariaLabel='Back to Meetings' to='/meetings' />
          <TeamPromptHeaderTitle>{meetingName}</TeamPromptHeaderTitle>
        </TeamPromptHeader>
      </HeadingBlock>
      <IconGroupBlock>
        {/* :TODO: (jmtaber129): Add avatars, etc. */}
        <ButtonContainer>
          <TeamPromptOptions meetingRef={meeting} />
        </ButtonContainer>
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
