import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useGotoStageId from '~/hooks/useGotoStageId'
import {
  NewMeetingPhaseTypeEnum,
  PokerSidebarPhaseListItemChildren_meeting$key
} from '~/__generated__/PokerSidebarPhaseListItemChildren_meeting.graphql'
import MeetingSidebarTeamMemberStageItems from './MeetingSidebarTeamMemberStageItems'
import PokerSidebarEstimateSection from './PokerSidebarEstimateSection'

interface Props {
  gotoStageId: ReturnType<typeof useGotoStageId>
  handleMenuClick: () => void
  phaseType: NewMeetingPhaseTypeEnum
  meeting: PokerSidebarPhaseListItemChildren_meeting$key
}

const PokerSidebarPhaseListItemChildren = (props: Props) => {
  const {gotoStageId, handleMenuClick, phaseType, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment PokerSidebarPhaseListItemChildren_meeting on PokerMeeting {
        ...MeetingSidebarTeamMemberStageItems_meeting
        ...PokerSidebarEstimateSection_meeting
        phases {
          phaseType
          stages {
            isComplete
          }
        }
      }
    `,
    meetingRef
  )
  if (phaseType === 'checkin') {
    return (
      <MeetingSidebarTeamMemberStageItems
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
        phaseType={phaseType}
      />
    )
  } else if (phaseType === 'ESTIMATE') {
    return (
      <PokerSidebarEstimateSection
        gotoStageId={gotoStageId}
        handleMenuClick={handleMenuClick}
        meeting={meeting}
      />
    )
  }
  return null
}

export default PokerSidebarPhaseListItemChildren
