import {commitMutation} from 'react-relay'
import {LOBBY} from 'universal/utils/constants'

graphql`
  fragment KillMeetingMutation_team on KillMeetingPayload {
    team {
      activeFacilitator
      facilitatorPhase
      facilitatorPhaseItem
      meetingId
      meetingPhase
      meetingPhaseItem
      newMeeting {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation KillMeetingMutation($teamId: ID!) {
    killMeeting(teamId: $teamId) {
      error {
        message
      }
      ...KillMeetingMutation_team @relay(mask: false)
    }
  }
`

export const killMeetingTeamUpdater = () => {
  console.log('Meeting was killed!')
}

const KillMeetingMutation = (environment, teamId, history, onError, onCompleted) => {
  return commitMutation(environment, {
    mutation,
    variables: {teamId},
    updater: () => {
      killMeetingTeamUpdater()
    },
    optimisticUpdater: (store) => {
      store
        .get(teamId)
        .setValue(LOBBY, 'facilitatorPhase')
        .setValue(LOBBY, 'meetingPhase')
        .setValue(null, 'meetingId')
        .setValue(null, 'facilitatorPhaseItem')
        .setValue(null, 'meetingPhaseItem')
        .setValue(null, 'activeFacilitator')
    },
    onCompleted,
    onError
  })
}

export default KillMeetingMutation
