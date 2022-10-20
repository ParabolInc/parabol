import graphql from 'babel-plugin-relay/macro'
import React, {ReactElement, Suspense} from 'react'
import {useFragment} from 'react-relay'
import {
  NewMeetingPhaseTypeEnum,
  RetroMeeting_meeting$key
} from '~/__generated__/RetroMeeting_meeting.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMeeting from '../hooks/useMeeting'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import NewMeetingAvatarGroup from '../modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {RetroDemo} from '../types/constEnums'
import lazyPreload, {LazyExoticPreload} from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingSidebar from './RetroMeetingSidebar'

interface Props {
  meeting: RetroMeeting_meeting$key
}

const phaseLookup = {
  checkin: lazyPreload(
    () => import(/* webpackChunkName: 'NewMeetingCheckIn' */ './NewMeetingCheckIn')
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
} as Record<NewMeetingPhaseTypeEnum, LazyExoticPreload<any>>

export interface RetroMeetingPhaseProps {
  toggleSidebar: () => void
  meeting: any
  avatarGroup: ReactElement
}

const RetroMeeting = (props: Props) => {
  const {meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment RetroMeeting_meeting on RetrospectiveMeeting {
        ...MeetingControlBar_meeting
        ...useMeeting_meeting
        ...RetroMeetingSidebar_meeting
        ...NewMeetingCheckIn_meeting
        ...RetroReflectPhase_meeting
        ...RetroGroupPhase_meeting
        ...RetroVotePhase_meeting
        ...RetroDiscussPhase_meeting
        ...NewMeetingAvatarGroup_meeting
        id
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
  if (!safeRoute) return null
  const {id: meetingId, showSidebar, localPhase} = meeting
  const localPhaseType = localPhase?.phaseType
  const Phase = phaseLookup[localPhaseType]

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
        />
      </Suspense>
      <MeetingControlBar
        isDemoStageComplete={isDemoStageComplete}
        meeting={meeting}
        handleGotoNext={handleGotoNext}
        gotoStageId={gotoStageId}
      />
    </MeetingStyles>
  )
}

export default RetroMeeting
