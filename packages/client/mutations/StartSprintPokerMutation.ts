import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {StartSprintPokerMutation as TStartSprintPokerMutation} from '../__generated__/StartSprintPokerMutation.graphql'
import type {NavigateLocalHandler, StandardMutation} from '../types/relayMutations'

graphql`
  fragment StartSprintPokerMutation_team on StartSprintPokerPayload {
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
  mutation StartSprintPokerMutation(
    $teamId: ID!
    $gcalInput: CreateGcalEventInput
    $ignoreSuggestedUpgrade: Boolean
  ) {
    startSprintPoker(teamId: $teamId, gcalInput: $gcalInput, ignoreSuggestedUpgrade: $ignoreSuggestedUpgrade) {
      meeting {
        # lets joinMeeting subscribe while the starter joins
        viewerMeetingMember {
          id
        }
      }
      ...StartSprintPokerMutation_team @relay(mask: false) @alias
    }
  }
`

const StartSprintPokerMutation: StandardMutation<
  TStartSprintPokerMutation,
  NavigateLocalHandler
> = (atmosphere, variables, {navigate, onError, onCompleted}) => {
  return commitMutation<TStartSprintPokerMutation>(atmosphere, {
    mutation,
    variables,
    onError,
    onCompleted: (res, errors) => {
      onCompleted(res, errors)
      const {startSprintPoker} = res
      const {meeting, hasGcalError} = startSprintPoker.StartSprintPokerMutation_team ?? {}
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
      navigate({to: '/meet/$meetingId', params: {meetingId}})
    }
  })
}

export default StartSprintPokerMutation
