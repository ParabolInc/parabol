import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {ModifyCheckInQuestionMutation as TModifyCheckInQuestionMutation} from '../__generated__/ModifyCheckInQuestionMutation.graphql'

graphql`
  fragment ModifyCheckInQuestionMutation_meeting on ModifyCheckInQuestionSuccess {
    modifiedCheckInQuestion
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

const ModifyCheckInQuestionMutation: StandardMutation<TModifyCheckInQuestionMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TModifyCheckInQuestionMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ModifyCheckInQuestionMutation
