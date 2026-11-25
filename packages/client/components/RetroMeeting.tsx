import graphql from 'babel-plugin-relay/macro'
import {type ReactElement, Suspense} from 'react'
import {useFragment} from 'react-relay'
import type {
  NewMeetingPhaseTypeEnum,
  RetroMeeting_meeting$key
} from '~/__generated__/RetroMeeting_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type useGotoStageId from '../hooks/useGotoStageId'
import useMeeting from '../hooks/useMeeting'
import useRightDrawer from '../hooks/useRightDrawer'
import useTeamHealthCheckInRetro from '../hooks/useTeamHealthCheckInRetro'
import type LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroDemo} from '../types/constEnums'
import lazyPreload, {type LazyPreloadedComponent} from '../utils/lazyPreload'
import getTeamHealthCheckShownInRetro from '../utils/meetings/getTeamHealthCheckShownInRetro'
import reportMissingMeetingPhase from '../utils/meetings/reportMissingMeetingPhase'
import MeetingControlBar from './MeetingControlBar'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingDrawer from './RetroMeetingDrawer'
import RetroMeetingSidebar from './RetroMeetingSidebar'
import getTeamHealthDiscussionId from './TeamHealth/getTeamHealthDiscussionId'
import useTemplateSwitchedSnackbar from './TeamPrompt/TemplateDrawer/useTemplateSwitchedSnackbar'

interface Props {
  meeting: RetroMeeting_meeting$key
}

const phaseLookup: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  checkin: lazyPreload(
    () => import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  TEAM_HEALTH: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'RetroTeamHealthPhase' */ './RetroTeamHealth/RetroTeamHealthPhase'
      )
  ),
  updates: lazyPreload(
    () => import(/* webpackChunkName: 'RetroMeetingUpdates' */ './RetroMeetingUpdates')
  ),
  reflect: lazyPreload(
    () =>
      import(/* webpackChunkName: 'RetroReflectPhase' */ './RetroReflectPhase/RetroReflectPhase')
  ),
  group: lazyPreload(() => import(/* webpackChunkName: 'RetroGroupPhase' */ './RetroGroupPhase')),
  vote: lazyPreload(() => import(/* webpackChunkName: 'RetroVotePhase' */ './RetroVotePhase')),
  discuss: lazyPreload(
    () => import(/* webpackChunkName: 'RetroDiscussPhase' */ './RetroDiscussPhase')
  )
}

// an older retro's Team Health phase was a one-question pulse, which keeps its own view
const TeamHealthPulse = lazyPreload(
  () => import(/* webpackChunkName: 'TeamHealth' */ './TeamHealth')
)

export interface RetroMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
  rightDrawerOpen?: string | null
  toggleDrawer?: () => void
  gotoStageId: ReturnType<typeof useGotoStageId>
}

const RetroMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeeting_meeting on RetrospectiveMeeting {
        ...MeetingControlBar_meeting
        ...useMeeting_meeting
        ...reportMissingMeetingPhase_meeting
        ...RetroMeetingSidebar_meeting
        ...NewMeetingCheckIn_meeting
        ...TeamHealth_meeting
        ...RetroTeamHealthPhase_meeting
        ...RetroMeetingUpdates_meeting
        ...RetroReflectPhase_meeting
        ...RetroGroupPhase_meeting
        ...RetroVotePhase_meeting
        ...RetroDiscussPhase_meeting
        ...RetroMeetingDrawer_meeting
        ...NewMeetingAvatarGroup_meeting
        ...MeetingLockedOverlay_meeting
        id
        templateId
        template {
          name
        }
        meetingSeries {
          cancelledAt
        }
        showSidebar
        rightDrawerOpen
        localPhase {
          phaseType
        }
        phases {
          phaseType
          stages {
            id
            ... on TeamHealthStage {
              labels
            }
          }
        }
        endedAt
        teamHealthMeeting {
          endedAt
          viewerMeetingMember {
            id
          }
          ...getTeamHealthDiscussionId_meeting
          ...useTeamHealthCheckInRetro_meeting
        }
      }
    `,
    meetingRef
  )
  const {toggleSidebar, handleGotoNext, gotoStageId, safeRoute, handleMenuClick, demoPortal} =
    useMeeting(meeting)
  const atmosphere = useAtmosphere()
  const {id: meetingId, showSidebar, localPhase, meetingSeries, rightDrawerOpen} = meeting
  const {phases, teamHealthMeeting} = meeting
  const shownCheck = getTeamHealthCheckShownInRetro(meeting)
  const localPhaseType = localPhase?.phaseType
  const showInspiration = localPhaseType === 'reflect' || localPhaseType === 'group'
  const teamHealthDiscussionId =
    localPhaseType === 'TEAM_HEALTH' && shownCheck
      ? getTeamHealthDiscussionId(shownCheck)
      : undefined
  const [toggleDrawer] = useRightDrawer(
    meetingId,
    showInspiration ? 'inspiration' : teamHealthDiscussionId ? 'discussion' : 'settings',
    false
  )
  // a check the retro started reveals just after the retro ends, so the retro keeps following its
  // check, but joins only a check it shows
  useTeamHealthCheckInRetro(
    teamHealthMeeting ?? null,
    localPhaseType === 'TEAM_HEALTH' && !!shownCheck
  )
  useTemplateSwitchedSnackbar({
    meetingId,
    templateId: meeting.templateId,
    templateName: meeting.template?.name,
    hasAnswers: false,
    isSeriesTemplate: !!meetingSeries && !meetingSeries.cancelledAt
  })
  if (!safeRoute) return null
  const teamHealthLabels = phases.find(({phaseType}) => phaseType === 'TEAM_HEALTH')?.stages[0]
    ?.labels
  const Phase: LazyPreloadedComponent =
    localPhaseType === 'TEAM_HEALTH' && teamHealthLabels?.length
      ? TeamHealthPulse
      : phaseLookup[localPhaseType]!
  if (!Phase) reportMissingMeetingPhase('RetroMeeting', meeting)
  const isDemo = meetingId === RetroDemo.MEETING_ID
  // Vote and discuss render their own drawer. The other phases share one, rendered here above the
  // swapped Phase so it stays mounted across phase changes instead of flickering. Hidden in the
  // demo: the mock DB doesn't serve the drawer's fields.
  const hasOwnDrawer = localPhaseType === 'vote' || localPhaseType === 'discuss'

  const isDemoStageComplete =
    meetingId === RetroDemo.MEETING_ID
      ? (atmosphere as unknown as LocalAtmosphere).clientGraphQLServer.isBotFinished()
      : false
  return (
    <MeetingStyles>
      {demoPortal()}
      <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar}>
        <RetroMeetingSidebar
          gotoStageId={gotoStageId}
          handleMenuClick={handleMenuClick}
          toggleSidebar={toggleSidebar}
          meeting={meeting}
        />
      </ResponsiveDashSidebar>
      <Suspense fallback={''}>
        <Phase
          meeting={meeting}
          toggleSidebar={toggleSidebar}
          avatarGroup={<NewMeetingAvatarGroup meetingRef={meeting} />}
          rightDrawerOpen={rightDrawerOpen}
          toggleDrawer={isDemo ? undefined : toggleDrawer}
          gotoStageId={gotoStageId}
        />
      </Suspense>
      {!isDemo && !hasOwnDrawer && (
        <RetroMeetingDrawer
          meeting={meeting}
          showInspiration={showInspiration}
          gotoStageId={gotoStageId}
          discussionId={teamHealthDiscussionId}
          canComment={!!shownCheck?.viewerMeetingMember}
        />
      )}
      <MeetingControlBar
        isDemoStageComplete={isDemoStageComplete}
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
      />
      <MeetingLockedOverlay meetingRef={meeting} />
    </MeetingStyles>
  )
}

export default RetroMeeting
