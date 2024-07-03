import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StartTeamPromptMutation as TStartTeamPromptMutation} from '../__generated__/StartTeamPromptMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartTeamPromptMutation_team on StartTeamPromptSuccess {
    meeting {
      id
      ...TeamPromptMeetingStatus_meeting
    }
    team {
      ...MeetingsDashActiveMeetings @relay(mask: false)
    }
    hasGcalError
  }
`

const mutation = graphql`
  mutation StartTeamPromptMutation(
    $teamId: ID!
    $name: String
    $rrule: RRule
    $gcalInput: CreateGcalEventInput
  ) {
    startTeamPrompt(teamId: $teamId, name: $name, rrule: $rrule, gcalInput: $gcalInput) {
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
      const {meeting, hasGcalError} = startTeamPrompt
      if (!meeting) return
      const {id: meetingId} = meeting
      if (hasGcalError) {
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: `gcalError:${meetingId}`,
          autoDismiss: 0,
          showDismissButton: true,
          message: `Sorry, we couldn't create your Google Calendar event`
        })
      }
      history.push(`/meet/${meetingId}`)
    },
    onError
  })
}

export default StartTeamPromptMutation
