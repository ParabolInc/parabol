import graphql from 'babel-plugin-relay/macro'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import plural from 'parabol-client/utils/plural'
import {makePokerStats_meeting} from 'parabol-client/__generated__/makePokerStats_meeting.graphql'
import {readInlineData} from 'react-relay'

const makePokerStats = (meetingRef: any) => {
  const meeting = readInlineData<makePokerStats_meeting>(
    graphql`
      fragment makePokerStats_meeting on PokerMeeting @inline {
        meetingMembers {
          isCheckedIn
        }
        phases {
          phaseType
          ... on EstimatePhase {
            stages {
              finalScore
              serviceTaskId
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {meetingMembers, phases} = meeting
  const estimatePhase = phases.find(
    (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.ESTIMATE
  )!
  const stages = estimatePhase.stages!
  const storyCount = new Set(stages.map((stage) => stage.serviceTaskId)).size

  const meetingMembersCount = meetingMembers.length
  const meetingMembersPresentCount = meetingMembers.filter((member) => member.isCheckedIn === true)
    .length
  const memberCount =
    meetingMembersPresentCount >= 10
      ? meetingMembersPresentCount
      : `${meetingMembersPresentCount}/${meetingMembersCount}`
  return [
    {value: '', label: ''},
    {value: storyCount, label: plural(storyCount, 'Story', 'Stories')},
    {value: memberCount, label: 'Present'},
    {value: '', label: ''}
  ]
}

export default makePokerStats
