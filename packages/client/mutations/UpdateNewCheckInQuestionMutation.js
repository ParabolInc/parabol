import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment UpdateNewCheckInQuestionMutation_team on UpdateNewCheckInQuestionPayload {
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
      ...UpdateNewCheckInQuestionMutation_team @relay(mask: false)
    }
  }
`

const UpdateNewCheckInQuestionMutation = (environment, variables, onCompleted, onError) => {
  return commitMutation(environment, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {meetingId, checkInQuestion} = variables
      const meeting = store.get(meetingId)
      const phases = meeting.getLinkedRecords('phases')
      const checkInPhase = phases.find((phase) => phase.getValue('__typename') === 'CheckInPhase')
      checkInPhase.setValue(checkInQuestion, 'checkInQuestion')
    },
    onCompleted,
    onError
  })
}

export default UpdateNewCheckInQuestionMutation
