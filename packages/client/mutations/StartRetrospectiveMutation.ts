import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StartRetrospectiveMutation as TStartRetrospectiveMutation} from '../__generated__/StartRetrospectiveMutation.graphql'
import {HistoryLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartRetrospectiveMutation_team on StartRetrospectiveSuccess {
    meeting {
      id
    }
    team {
      ...MeetingsDashActiveMeetings @relay(mask: false)
      meetingSettings(meetingType: retrospective) {
        ... on RetrospectiveMeetingSettings {
          selectedTemplate {
            subCategories
          }
        }
      }
    }
    hasGcalError
  }
`

const mutation = graphql`
  mutation StartRetrospectiveMutation(
    $teamId: ID!
    $name: String
    $rrule: RRule
    $gcalInput: CreateGcalEventInput
  ) {
    startRetrospective(teamId: $teamId, name: $name, rrule: $rrule, gcalInput: $gcalInput) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...StartRetrospectiveMutation_team @relay(mask: false)
    }
  }
`

const StartRetrospectiveMutation: StandardMutation<
  TStartRetrospectiveMutation,
  HistoryLocalHandler
> = (atmosphere, variables, {history, onError, onCompleted}) => {
  return commitMutation<TStartRetrospectiveMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startRetrospective} = res
      const {meeting, hasGcalError} = startRetrospective
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

export default StartRetrospectiveMutation
