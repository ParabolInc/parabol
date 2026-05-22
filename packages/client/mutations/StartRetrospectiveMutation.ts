import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {StartRetrospectiveMutation as TStartRetrospectiveMutation} from '../__generated__/StartRetrospectiveMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartRetrospectiveMutation_team on StartRetrospectiveSuccess {
    meeting {
      id
    }
    meetingSeries {
      id
      title
      nextMeetingDate
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
      const startRetrospective = res?.startRetrospective
      if (!startRetrospective) return
      const {meeting, meetingSeries, hasGcalError} = startRetrospective
      if (!meeting) {
        // schedule-only: no meeting was started; the cron will spawn the next one
        if (meetingSeries) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: `meetingScheduled:${meetingSeries.id}`,
            autoDismiss: 10,
            showDismissButton: true,
            message: `🗓️ "${meetingSeries.title}" is scheduled to start at the next recurrence.`
          })
        }
        return
      }
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
