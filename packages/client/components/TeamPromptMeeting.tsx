import React, {Suspense} from 'react'
import {Link} from 'react-router-dom'

import logoMarkPurple from '../styles/theme/images/brand/mark-color.svg'
import MeetingArea from './MeetingArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingStyles from './MeetingStyles'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

interface Props {
  meeting: any
}

const TeamPromptMeeting = (_props: Props) => {
  return (
    <MeetingStyles>
      <MeetingArea>
        <Suspense fallback={''}>
          <MeetingContent>
            <MeetingHeaderAndPhase hideBottomBar={true}>
              <MeetingTopBar
                avatarGroup={/*:TODO: (jmtaber129): Add avatar group*/<></>}
                isMeetingSidebarCollapsed={true}
              >
                {/* :TODO: (jmtaber129): Add back button */}
                <PhaseHeaderTitle>Hard-coded standup title</PhaseHeaderTitle>
              </MeetingTopBar>
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
