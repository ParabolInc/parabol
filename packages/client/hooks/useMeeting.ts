import graphql from 'babel-plugin-relay/macro'
import useDocumentTitle from './useDocumentTitle'
import useMeetingLocalState from './useMeetingLocalState'
import useSwarm from './useSwarm'
import {meetingTypeToLabel} from '../utils/meetings/lookups'
import useBreakpoint from './useBreakpoint'
import useResumeFacilitation from './useResumeFacilitation'
import {Breakpoint} from '../types/constEnums'
import isDemoRoute from 'utils/isDemoRoute'
import {readInlineData} from 'relay-runtime'
import useGotoStageId from './useGotoStageId'
import useGotoNext from './useGotoNext'
import useEndMeetingHotkey from './useEndMeetingHotkey'
import useGotoNextHotkey from './useGotoNextHotkey'
import useGotoPrevHotkey from './useGotoPrevHotkey'
import useDemoMeeting from './useDemoMeeting'
import useToggleSidebar from './useToggleSidebar'
import useHandleMenuClick from './useHandleMenuClick'
import useMobileSidebarDefaultClosed from './useMobileSidebarDefaultClosed'
import {useMeeting_meeting} from '__generated__/useMeeting_meeting.graphql'

const useMeeting = (meetingRef: any) => {
  const meeting = readInlineData<useMeeting_meeting>(
    graphql`
      fragment useMeeting_meeting on NewMeeting @inline {
        ...useGotoStageId_meeting
        ...useGotoNext_meeting
        ...useGotoPrev_meeting
        ...useMeetingLocalState_meeting
        ...useResumeFacilitation_meeting
        id
        meetingType
        showSidebar
        team {
          id
          name
        }
      }
    `,
    meetingRef
  )
  const {id: meetingId, meetingType, showSidebar, team} = meeting
  const {id: teamId, name: teamName} = team
  const gotoStageId = useGotoStageId(meeting)
  const handleGotoNext = useGotoNext(meeting, gotoStageId)
  const safeRoute = useMeetingLocalState(meeting)
  useResumeFacilitation(meeting)
  useEndMeetingHotkey(meetingId)
  useGotoNextHotkey(handleGotoNext.gotoNext)
  useGotoPrevHotkey(meeting, gotoStageId)
  // save a few cycles
  const demoPortal = isDemoRoute() ? useDemoMeeting() : () => null // eslint-disable-line
  useDocumentTitle(`${meetingTypeToLabel[meetingType]} Meeting | ${teamName}`)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const toggleSidebar = useToggleSidebar(meetingId)
  const handleMenuClick = useHandleMenuClick(teamId, isDesktop)
  useMobileSidebarDefaultClosed(isDesktop, meetingId)
  const {streams, swarm} = useSwarm(teamId)
  return {
    demoPortal,
    handleGotoNext,
    gotoStageId,
    safeRoute,
    toggleSidebar,
    streams,
    swarm,
    isDesktop,
    handleMenuClick
  }
}

export default useMeeting
