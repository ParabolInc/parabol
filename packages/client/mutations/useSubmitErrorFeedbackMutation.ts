import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useSubmitErrorFeedbackMutation as TSubmitErrorFeedbackMutation} from '../__generated__/useSubmitErrorFeedbackMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useSubmitErrorFeedbackMutation(
    $errorMessage: String!
    $content: String!
    $eventId: ID!
    $email: String
  ) {
    submitErrorFeedback(
      errorMessage: $errorMessage
      content: $content
      eventId: $eventId
      email: $email
    ) {
      success
    }
  }
`

const useSubmitErrorFeedbackMutation = () => {
  const [commit, submitting] = useMutation<TSubmitErrorFeedbackMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TSubmitErrorFeedbackMutation>) => {
    return commit({onError: snackOnError(atmosphere), ...config})
  }
  return [execute, submitting] as const
}

export default useSubmitErrorFeedbackMutation
