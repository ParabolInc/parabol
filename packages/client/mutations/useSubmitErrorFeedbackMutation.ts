import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useSubmitErrorFeedbackMutation as TSubmitErrorFeedbackMutation} from '../__generated__/useSubmitErrorFeedbackMutation.graphql'

const mutation = graphql`
  mutation useSubmitErrorFeedbackMutation(
    $errorMessage: String!
    $content: String!
    $eventId: ID
    $email: String
  ) {
    submitErrorFeedback(
      errorMessage: $errorMessage
      content: $content
      eventId: $eventId
      email: $email
    ) {
      feedbackId
    }
  }
`

const useSubmitErrorFeedbackMutation = () => {
  const [commit, submitting] = useMutation<TSubmitErrorFeedbackMutation>(mutation)
  const execute = (config: UseMutationConfig<TSubmitErrorFeedbackMutation>) => {
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useSubmitErrorFeedbackMutation
