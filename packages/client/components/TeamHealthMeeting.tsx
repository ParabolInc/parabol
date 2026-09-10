import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingPhaseTypeEnum} from '~/__generated__/RetroMeeting_meeting.graphql'
import type {TeamHealthMeeting_meeting$key} from '~/__generated__/TeamHealthMeeting_meeting.graphql'
import useMeeting from '../hooks/useMeeting'
import useRightDrawer from '../hooks/useRightDrawer'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import lazyPreload, {type LazyPreloadedComponent} from '../utils/lazyPreload'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import MeetingTopBar from './MeetingTopBar'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import TeamHealthDiscussionDrawer from './TeamHealth/TeamHealthDiscussionDrawer'
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
        ...TeamHealthDiscussionDrawer_meeting
        ...NewMeetingAvatarGroup_meeting
        id
        endedAt
        showSidebar
        rightDrawerOpen
        localPhase {
          phaseType
        }
        localStage {
          id
        }
        # localStage is a client-side link into these records, so discussionId has to be selected
        # here to be fetched at all. Concrete type conditions rather than DiscussionThreadStage,
        # since relay can only match an abstract condition on a server-fetched field
        phases {
          stages {
            id
            ... on TeamHealthResponseStage {
              discussionId
            }
            ... on TeamHealthResultStage {
              discussionId
            }
          }
        }
      }
    `,
    meetingRef
  )
  const {gotoStageId, safeRoute, toggleSidebar, handleMenuClick} = useMeeting(meeting)
  const [toggleDrawer] = useRightDrawer(meeting.id)
  if (!safeRoute) return null
  const {endedAt, showSidebar, rightDrawerOpen, localStage, phases} = meeting
  const localPhaseType = meeting.localPhase?.phaseType as NewMeetingPhaseTypeEnum | undefined
  // the results are still hidden here, so the stage's discussion has nothing to discuss yet
  const isAwaitingReveal = localPhaseType === 'TEAM_HEALTH_RESULT' && !endedAt
  const Phase = isAwaitingReveal
    ? TeamHealthSubmittedPhase
    : localPhaseType
      ? phaseLookup[localPhaseType]
      : undefined
  const discussionId = isAwaitingReveal
    ? undefined
    : phases.flatMap((phase) => phase.stages).find((stage) => stage.id === localStage?.id)
        ?.discussionId
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
        <MeetingTopBar
          avatarGroup={<NewMeetingAvatarGroup meetingRef={meeting} />}
          isMeetingSidebarCollapsed={!showSidebar}
          rightDrawerOpen={rightDrawerOpen}
          toggleDrawer={discussionId ? toggleDrawer : undefined}
          toggleSidebar={toggleSidebar}
        />
        <div className='min-h-0 flex-1'>
          <Suspense fallback={''}>
            {Phase && <Phase meeting={meeting} gotoStageId={gotoStageId} />}
          </Suspense>
        </div>
      </div>
      {discussionId && (
        <TeamHealthDiscussionDrawer
          meeting={meeting}
          discussionId={discussionId}
          toggleDrawer={toggleDrawer}
        />
      )}
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default TeamHealthMeeting
