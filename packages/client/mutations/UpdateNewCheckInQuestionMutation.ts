import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {RecordProxy} from 'relay-runtime'
import {UpdateNewCheckInQuestionMutation as TUpdateNewCheckInQuestionMutation} from '../__generated__/UpdateNewCheckInQuestionMutation.graphql'
import {StandardMutation} from '../types/relayMutations'
graphql`
  fragment UpdateNewCheckInQuestionMutation_meeting on UpdateNewCheckInQuestionPayload {
    meeting {
      phases {
        ... on CheckInPhase {
          checkInQuestion
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateNewCheckInQuestionMutation($meetingId: ID!, $checkInQuestion: String!) {
    updateNewCheckInQuestion(meetingId: $meetingId, checkInQuestion: $checkInQuestion) {
      error {
        message
      }
      ...UpdateNewCheckInQuestionMutation_meeting @relay(mask: false)
    }
  }
`

type CheckInPhase = NonNullable<
  NonNullable<TUpdateNewCheckInQuestionMutation['response']['updateNewCheckInQuestion']>['meeting']
>['phases'][0]

const UpdateNewCheckInQuestionMutation: StandardMutation<TUpdateNewCheckInQuestionMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, checkInQuestion} = variables
      if (!checkInQuestion) return
      const meeting = store.get(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      if (!phases) return
      const checkInPhase = phases.find(
        (phase) => phase.getValue('__typename') === 'CheckInPhase'
      ) as RecordProxy<CheckInPhase>
      checkInPhase.setValue(checkInQuestion, 'checkInQuestion')
    },
    onCompleted,
    onError
  })
}

export default UpdateNewCheckInQuestionMutation
