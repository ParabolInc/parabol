import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ICheckInPhase, INewMeeting} from '../types/graphql'
import {RecordProxy} from 'relay-runtime'
import {SimpleMutation} from '../types/relayMutations'
import {UpdateNewCheckInQuestionMutation as TUpdateNewCheckInQuestionMutation} from '../__generated__/UpdateNewCheckInQuestionMutation.graphql'
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

const UpdateNewCheckInQuestionMutation: SimpleMutation<TUpdateNewCheckInQuestionMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, checkInQuestion} = variables
      if (!checkInQuestion) return
      const meeting = store.get<INewMeeting>(meetingId)
      if (!meeting) return
      const phases = meeting.getLinkedRecords('phases')
      const checkInPhase = phases.find(
        (phase) => phase.getValue('__typename') === 'CheckInPhase'
      ) as RecordProxy<ICheckInPhase>
      checkInPhase.setValue(checkInQuestion, 'checkInQuestion')
    }
  })
}

export default UpdateNewCheckInQuestionMutation
