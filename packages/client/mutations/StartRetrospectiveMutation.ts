import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {StartRetrospectiveMutation as TStartRetrospectiveMutation} from '../__generated__/StartRetrospectiveMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'

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
    $ignoreSuggestedUpgrade: Boolean
  ) {
    startRetrospective(
      teamId: $teamId
      name: $name
      rrule: $rrule
      gcalInput: $gcalInput
      ignoreSuggestedUpgrade: $ignoreSuggestedUpgrade
    ) {
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
  NavigateLocalHandler
> = (atmosphere, variables, {navigate, onError, onCompleted}) => {
  return commitMutation<TStartRetrospectiveMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startRetrospective} = res
      if (!startRetrospective) return
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
      navigate(`/meet/${meetingId}`)
    }
  })
}

export default StartRetrospectiveMutation
