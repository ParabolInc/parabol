import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React from 'react'
import {useFragment} from 'react-relay'

import { TeamPromptTopBar_meeting$key } from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import BackButton from '../BackButton'
import {HeadingBlock, MeetingTopBarStyles} from '../MeetingTopBar'

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

interface Props {
  meetingRef: TeamPromptTopBar_meeting$key
}

const TeamPromptTopBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptTopBar_meeting on TeamPromptMeeting {
        name
      }
    `,
    meetingRef
  )

  const { name: meetingName } = meeting

  return (
    <MeetingTopBarStyles>
      <HeadingBlock>
        <TeamPromptHeader>
          <BackButton ariaLabel='Back to Meetings' to='/meetings' />
          <TeamPromptHeaderTitle>{meetingName}</TeamPromptHeaderTitle>
        </TeamPromptHeader>
      </HeadingBlock>
      {/* :TODO: (jmtaber129): Add avatars, overflow menu, etc. */}
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
