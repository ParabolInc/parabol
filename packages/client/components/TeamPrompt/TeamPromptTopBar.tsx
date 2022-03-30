import styled from '@emotion/styled'
import React from 'react'
import useRouter from '~/hooks/useRouter'
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

const TeamPromptTopBar = () => {
  const {history} = useRouter()

  return (
    <MeetingTopBarStyles>
      <HeadingBlock>
        <TeamPromptHeader>
          <BackButton
            ariaLabel='Back to Meetings'
            onClick={() => history.push('/meetings')}
          />
          <TeamPromptHeaderTitle>Hard-coded standup title</TeamPromptHeaderTitle>
        </TeamPromptHeader>
      </HeadingBlock>
      {/* :TODO: (jmtaber129): Add avatars, overflow menu, etc. */}
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
