import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'
import {StartTeamPromptMutation as TStartTeamPromptMutation} from '../__generated__/StartTeamPromptMutation.graphql'

graphql`
  fragment StartTeamPromptMutation_team on StartTeamPromptSuccess {
    meeting {
      id
      ...TeamPromptMeetingStatus_meeting
    }
    team {
      ...MeetingsDashActiveMeetings @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation StartTeamPromptMutation($teamId: ID!, $recurrenceSettings: RecurrenceSettingsInput) {
    startTeamPrompt(teamId: $teamId, recurrenceSettings: $recurrenceSettings) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartTeamPromptMutation_team @relay(mask: false)
    }
  }
`

const StartTeamPromptMutation: StandardMutation<TStartTeamPromptMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartTeamPromptMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startTeamPrompt} = res
      const {meeting} = startTeamPrompt
      if (!meeting) return
      const {id: meetingId} = meeting
      history.push(`/meet/${meetingId}`)
    },
    onError
  })
}

export default StartTeamPromptMutation
