import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StartCheckInMutation as TStartCheckInMutation} from '../__generated__/StartCheckInMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartCheckInMutation_team on StartCheckInSuccess {
    meeting {
      id
    }
    team {
      ...MeetingsDashActiveMeetings @relay(mask: false)
    }
    hasGcalError
  }
`

const mutation = graphql`
  mutation StartCheckInMutation($teamId: ID!, $gcalInput: CreateGcalEventInput) {
    startCheckIn(teamId: $teamId, gcalInput: $gcalInput) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartCheckInMutation_team @relay(mask: false)
    }
  }
`

const StartCheckInMutation: StandardMutation<TStartCheckInMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartCheckInMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startCheckIn} = res
      const {meeting, hasGcalError} = startCheckIn
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
    }
  })
}

export default StartCheckInMutation
