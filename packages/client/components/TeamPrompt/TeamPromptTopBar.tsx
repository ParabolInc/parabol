import React from 'react'
import {HeadingBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import PhaseHeaderTitle from '../PhaseHeaderTitle'

const TeamPromptTopBar = () => {
  return (
    <MeetingTopBarStyles>
      <HeadingBlock isMeetingSidebarCollapsed={true}>
        {/* :TODO: (jmtaber129): Add back button */}
        <PhaseHeaderTitle>Hard-coded standup title</PhaseHeaderTitle>
        {/* :TODO: (jmtaber129): Add avatars, overflow menu, etc. */}
      </HeadingBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
