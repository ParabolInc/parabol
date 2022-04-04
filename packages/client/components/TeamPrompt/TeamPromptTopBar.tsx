import styled from '@emotion/styled'
import React from 'react'
import {HeadingBlock, MeetingTopBarStyles} from '../MeetingTopBar'

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0
})

const TeamPromptTopBar = () => {
  return (
    <MeetingTopBarStyles>
      <HeadingBlock>
        {/* :TODO: (jmtaber129): Add back button */}
        <TeamPromptHeaderTitle>Hard-coded standup title</TeamPromptHeaderTitle>
        {/* :TODO: (jmtaber129): Add avatars, overflow menu, etc. */}
      </HeadingBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
