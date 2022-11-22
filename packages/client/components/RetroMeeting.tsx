import styled from '@emotion/styled'
import {Lock} from '@mui/icons-material'
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
import {modalShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Radius, RetroDemo} from '../types/constEnums'
import lazyPreload, {LazyExoticPreload} from '../utils/lazyPreload'
import MeetingControlBar from './MeetingControlBar'
import MeetingStyles from './MeetingStyles'
import PrimaryButton from './PrimaryButton'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroMeetingSidebar from './RetroMeetingSidebar'

interface Props {
  meeting: RetroMeeting_meeting$key
}

const DialogOverlay = styled('div')({
  position: 'fixed',
  width: '100%',
  height: '100%',
  //backgroundColor: '#aaaaaaaa',
  backdropFilter: 'blur(3px)',
  zIndex: 100,
  paddingTop: '20%'
})

const DialogContainer = styled('div')({
  display: 'flex',
  backgroundColor: 'white',
  borderRadius: Radius.DIALOG,
  boxShadow: modalShadow,
  flexDirection: 'column',
  // overflow: 'auto', removed because react-beautiful-dnd only supports 1 scrolling parent
  margin: '0 auto',
  maxHeight: '90vh',
  maxWidth: 'calc(100vw - 48px)',
  minWidth: 280,
  width: 512,
  alignItems: 'center',
  padding: 24
})

const TimelineEventTitle = styled('span')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '20px'
})

const TimelineEventBody = styled('div')({
  padding: '0 16px 16px 16px',
  fontSize: 14,
  lineHeight: '20px',
  textAlign: 'center'
})

const EventIcon = styled('div')({
  borderRadius: '100%',
  color: PALETTE.GRAPE_500,
  display: 'block',
  userSelect: 'none',
  height: 40,
  width: 40,
  svg: {
    height: 40,
    width: 40
  }
})

const HeaderText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  fontSize: 14,
  justifyContent: 'space-around',
  lineHeight: '20px',
  margin: '16px 16px 8px',
  paddingTop: 2
})

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
        locked
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
      <DialogOverlay>
        <DialogContainer>
          <EventIcon>
            <Lock />
          </EventIcon>
          <HeaderText>
            <TimelineEventTitle>Past Meetings Locked</TimelineEventTitle>
          </HeaderText>
          <TimelineEventBody>
            Your plan includes 30 days of meeting history. Unlock more by upgrading.
          </TimelineEventBody>
          <PrimaryButton>Unlock past meetings</PrimaryButton>
        </DialogContainer>
      </DialogOverlay>
    </MeetingStyles>
  )
}

export default RetroMeeting
