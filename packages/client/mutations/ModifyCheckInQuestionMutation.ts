import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {SimpleMutation} from '../types/relayMutations'
import {ModifyCheckInQuestionMutation as TModifyCheckInQuestionMutation} from '../__generated__/ModifyCheckInQuestionMutation.graphql'
import CheckInPhase from 'parabol-server/database/types/CheckInPhase'
import {RecordProxy} from 'relay-runtime'

graphql`
  fragment ModifyCheckInQuestionMutation_meeting on ModifyCheckInQuestionSuccess {
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
  mutation ModifyCheckInQuestionMutation(
    $meetingId: ID!
    $checkInQuestion: String!
    $modifyType: ModifyType!
  ) {
    modifyCheckInQuestion(
      meetingId: $meetingId
      checkInQuestion: $checkInQuestion
      modifyType: $modifyType
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ModifyCheckInQuestionMutation_meeting @relay(mask: false)
    }
  }
`

const ModifyCheckInQuestionMutation: SimpleMutation<TModifyCheckInQuestionMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TModifyCheckInQuestionMutation>(atmosphere, {
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
    }
  })
}

export default ModifyCheckInQuestionMutation
