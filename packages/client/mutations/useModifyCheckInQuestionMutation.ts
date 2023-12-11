import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useModifyCheckInQuestionMutation as TModifyCheckInQuestionMutation} from '../__generated__/useModifyCheckInQuestionMutation.graphql'

graphql`
  fragment useModifyCheckInQuestionMutation_success on ModifyCheckInQuestionSuccess {
    modifiedCheckInQuestion
  }
`

const mutation = graphql`
  mutation useModifyCheckInQuestionMutation(
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
      ...useModifyCheckInQuestionMutation_success @relay(mask: false)
    }
  }
`

export const useModifyCheckInQuestionMutation = () => {
  const [commit, submitting] = useMutation<TModifyCheckInQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TModifyCheckInQuestionMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
