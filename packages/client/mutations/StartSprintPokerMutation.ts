import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StartSprintPokerMutation as TStartSprintPokerMutation} from '../__generated__/StartSprintPokerMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartSprintPokerMutation_team on StartSprintPokerSuccess {
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
  mutation StartSprintPokerMutation($teamId: ID!, $gcalInput: CreateGcalEventInput) {
    startSprintPoker(teamId: $teamId, gcalInput: $gcalInput) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartSprintPokerMutation_team @relay(mask: false)
    }
  }
`

const StartSprintPokerMutation: StandardMutation<TStartSprintPokerMutation, HistoryLocalHandler> = (
  atmosphere,
  variables,
  {history, onError, onCompleted}
) => {
  return commitMutation<TStartSprintPokerMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startSprintPoker} = res
      const {meeting, hasGcalError} = startSprintPoker
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

export default StartSprintPokerMutation
