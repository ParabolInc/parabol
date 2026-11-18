import graphql from 'babel-plugin-relay/macro'
import {type ReactElement, Suspense} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {
  NewMeetingPhaseTypeEnum,
  RetroMeeting_meeting$key
} from '~/__generated__/RetroMeeting_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import type useGotoStageId from '../hooks/useGotoStageId'
import useMeeting from '../hooks/useMeeting'
import type LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroDemo} from '../types/constEnums'
import lazyPreload, {type LazyPreloadedComponent} from '../utils/lazyPreload'
import reportMissingMeetingPhase from '../utils/meetings/reportMissingMeetingPhase'
import MeetingControlBar from './MeetingControlBar'
import MeetingLockedOverlay from './MeetingLockedOverlay'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingDrawer from './RetroMeetingDrawer'
import RetroMeetingSidebar from './RetroMeetingSidebar'
import useTemplateSwitchedSnackbar from './TeamPrompt/TemplateDrawer/useTemplateSwitchedSnackbar'

interface Props {
  meeting: RetroMeeting_meeting$key
}

const phaseLookup: Partial<Record<NewMeetingPhaseTypeEnum, LazyPreloadedComponent>> = {
  checkin: lazyPreload(
    () => import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
  ),
  TEAM_HEALTH: lazyPreload(() => import(/* webpackChunkName: 'TeamHealth' */ './TeamHealth')),
  TEAM_HEALTH_CHECK: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'RetroTeamHealthCheckPhase' */ './RetroTeamHealth/RetroTeamHealthCheckPhase'
      )
  ),
  TEAM_HEALTH_CHECK_RESULT: lazyPreload(
    () =>
      import(
        /* webpackChunkName: 'RetroTeamHealthResultPhase' */ './RetroTeamHealth/RetroTeamHealthResultPhase'
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

export interface RetroMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
  openSettings?: () => void
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
        ...RetroTeamHealthCheckPhase_meeting
        ...RetroTeamHealthResultPhase_meeting
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
        localPhase {
          phaseType
        }
        phases {
          phaseType
          stages {
            id
          }
        }
      }
    `,
    meetingRef
  )
  const {toggleSidebar, handleGotoNext, gotoStageId, safeRoute, handleMenuClick, demoPortal} =
    useMeeting(meeting)
  const atmosphere = useAtmosphere()
  const {id: meetingId, showSidebar, localPhase, meetingSeries} = meeting
  useTemplateSwitchedSnackbar({
    meetingId,
    templateId: meeting.templateId,
    templateName: meeting.template?.name,
    hasAnswers: false,
    isSeriesTemplate: !!meetingSeries && !meetingSeries.cancelledAt
  })
  if (!safeRoute) return null
  const localPhaseType = localPhase?.phaseType
  const Phase = phaseLookup[localPhaseType]!
  if (!Phase) reportMissingMeetingPhase('RetroMeeting', meeting)
  const isDemo = meetingId === RetroDemo.MEETING_ID
  // Vote, discuss and Health Results render their own drawer. The other phases share one, rendered
  // here above the swapped Phase so it stays mounted across phase changes instead of flickering.
  // Hidden in the demo: the mock DB doesn't serve the drawer's fields.
  const hasOwnDrawer =
    localPhaseType === 'vote' ||
    localPhaseType === 'discuss' ||
    localPhaseType === 'TEAM_HEALTH_CHECK_RESULT'
  const showInspiration = localPhaseType === 'reflect' || localPhaseType === 'group'
  const openSettings = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const meetingProxy = store.get(meetingId)
      if (!meetingProxy) return
      const isOnSettings = meetingProxy.getValue('rightDrawerOpen') === 'settings'
      meetingProxy.setValue(isOnSettings ? null : 'settings', 'rightDrawerOpen')
    })
  }

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
          openSettings={isDemo ? undefined : openSettings}
          gotoStageId={gotoStageId}
        />
      </Suspense>
      {!isDemo && !hasOwnDrawer && (
        <RetroMeetingDrawer
          meeting={meeting}
          showInspiration={showInspiration}
          gotoStageId={gotoStageId}
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
