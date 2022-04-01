import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {Link} from 'react-router-dom'

import { TeamPromptMeeting_meeting$key } from '~/__generated__/TeamPromptMeeting_meeting.graphql'
import logoMarkPurple from '../styles/theme/images/brand/mark-color.svg'
import MeetingArea from './MeetingArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingStyles from './MeetingStyles'
import TeamPromptTopBar from './TeamPrompt/TeamPromptTopBar'
import PhaseWrapper from './PhaseWrapper'
import {useFragment} from 'react-relay'

interface Props {
  meeting: TeamPromptMeeting_meeting$key
}

const TeamPromptMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptMeeting_meeting on TeamPromptMeeting {
        ...TeamPromptTopBar_meeting
      }
    `,
    meetingRef
  )

  return (
    <MeetingStyles>
      <MeetingArea>
        <Suspense fallback={''}>
          <MeetingContent>
            <MeetingHeaderAndPhase hideBottomBar={true}>
              <TeamPromptTopBar meeting={meeting} />
              <PhaseWrapper>
                <Link title='My Dashboard' to='/meetings'>
                  <img alt='Parabol' src={logoMarkPurple} />
                </Link>
              </PhaseWrapper>
            </MeetingHeaderAndPhase>
          </MeetingContent>
        </Suspense>
      </MeetingArea>
    </MeetingStyles>
  )
}

export default TeamPromptMeeting
