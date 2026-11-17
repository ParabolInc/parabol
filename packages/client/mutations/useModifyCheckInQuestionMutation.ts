import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useModifyCheckInQuestionMutation as TModifyCheckInQuestionMutation} from '../__generated__/useModifyCheckInQuestionMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment useModifyCheckInQuestionMutation_success on ModifyCheckInQuestionPayload {
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
      ...useModifyCheckInQuestionMutation_success @relay(mask: false) @alias
    }
  }
`

export const useModifyCheckInQuestionMutation = () => {
  const [commit, submitting] = useMutation<TModifyCheckInQuestionMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TModifyCheckInQuestionMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}
