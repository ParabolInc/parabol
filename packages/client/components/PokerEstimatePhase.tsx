import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import {PokerEstimatePhase_meeting} from '../__generated__/PokerEstimatePhase_meeting.graphql'
import EstimatePhaseArea from './EstimatePhaseArea'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'
import PokerEstimateHeaderCardJira from './PokerEstimateHeaderCardJira'
import {PokerMeetingPhaseProps} from './PokerMeeting'

interface Props extends PokerMeetingPhaseProps {
  meeting: PokerEstimatePhase_meeting
}

const PokerEstimatePhase = (props: Props) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const {localStage, endedAt, showSidebar} = meeting
  if (!localStage) return null
  const {story} = localStage
  const {__typename} = story!
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
        </MeetingTopBar>
        {__typename === 'JiraIssue' && <PokerEstimateHeaderCardJira stage={localStage as any} />}
        <PhaseWrapper>
          <EstimatePhaseArea />
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment PokerEstimatePhaseStage on EstimateStage {
    ...PokerEstimateHeaderCardJira_stage
    story {
      __typename
    }
  }
`
export default createFragmentContainer(
  PokerEstimatePhase,
  {
    meeting: graphql`
    fragment PokerEstimatePhase_meeting on PokerMeeting {
      id
      endedAt
      showSidebar
      localStage {
        ...PokerEstimatePhaseStage @relay(mask: false)
      }
      phases {
        ...on EstimatePhase {
          stages {
            ...PokerEstimatePhaseStage @relay(mask: false)
          }
        }
      }
    }`
  }
)
