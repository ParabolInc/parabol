import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/RetroMeeting_meeting.graphql'
import type {TeamHealthMeeting_meeting$key} from '~/__generated__/TeamHealthMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import lazyPreload, {type LazyPreloadedComponent} from '../utils/lazyPreload'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import SidebarToggle from './SidebarToggle'
import TeamHealthMeetingSidebar from './TeamHealthMeetingSidebar'

interface Props {
  meeting: TeamHealthMeeting_meeting$key
}

const phaseLookup: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  TEAM_HEALTH_INTRO: lazyPreload(
    () => import(/* webpackChunkName: 'TeamHealthIntroPhase' */ './TeamHealth/TeamHealthIntroPhase')
  ),
  TEAM_HEALTH_RESPONSE: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'TeamHealthResponsePhase' */ './TeamHealth/TeamHealthResponsePhase'
      )
  ),
  TEAM_HEALTH_RESULT: lazyPreload(
    () =>
      import(/* webpackChunkName: 'TeamHealthResultPhase' */ './TeamHealth/TeamHealthResultPhase')
  )
}

// the result phase is a waiting room until the owner reveals, which is the act of ending the meeting
const TeamHealthSubmittedPhase = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamHealthSubmittedPhase' */ './TeamHealth/TeamHealthSubmittedPhase'
    )
)

const TeamHealthMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment TeamHealthMeeting_meeting on TeamHealthMeeting {
        ...useMeeting_meeting
        ...MeetingLockedOverlay_meeting
        ...TeamHealthMeetingSidebar_meeting
        ...TeamHealthIntroPhase_meeting
        ...TeamHealthResponsePhase_meeting
        ...TeamHealthSubmittedPhase_meeting
        ...TeamHealthResultPhase_meeting
        id
        endedAt
        showSidebar
        localPhase {
          phaseType
        }
      }
    `,
    meetingRef
  )
  const {gotoStageId, safeRoute, toggleSidebar, handleMenuClick} = useMeeting(meeting)
  if (!safeRoute) return null
  const {endedAt, showSidebar} = meeting
  const localPhaseType = meeting.localPhase?.phaseType as NewMeetingPhaseTypeEnum | undefined
  const Phase =
    localPhaseType === 'TEAM_HEALTH_RESULT' && !endedAt
      ? TeamHealthSubmittedPhase
      : localPhaseType
        ? phaseLookup[localPhaseType]
        : undefined
  return (
    <MeetingStyles>
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <TeamHealthMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <div className='flex h-full min-w-0 flex-1 flex-col overflow-auto'>
        {!showSidebar && (
          <div className='shrink-0 px-4 pt-4'>
            <SidebarToggle dataCy='topbar' onClick={toggleSidebar} />
          </div>
        )}
        <div className='min-h-0 flex-1'>
          <Suspense fallback={''}>
            {Phase && <Phase meeting={meeting} gotoStageId={gotoStageId} />}
          </Suspense>
        </div>
      </div>
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamHealthMeeting
