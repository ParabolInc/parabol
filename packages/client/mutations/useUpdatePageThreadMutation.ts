import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePageThreadMutation as TuseUpdatePageThreadMutation} from '../__generated__/useUpdatePageThreadMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnPayloadError} from './handlers/snackOnPayloadError'

graphql`
  fragment useUpdatePageThreadMutation_notification on UpdatePageThreadSuccess {
    thread {
      id
      ...PageThreadCard_thread
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageThreadMutation($threadId: ID!, $isResolved: Boolean!) {
    updatePageThread(threadId: $threadId, isResolved: $isResolved) {
      ...useUpdatePageThreadMutation_notification @relay(mask: false)
    }
  }
`

export const useUpdatePageThreadMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseUpdatePageThreadMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageThreadMutation>) => {
    return commit({
      ...config,
      onCompleted: snackOnPayloadError(atmosphere, 'updatePageThreadError', config.onCompleted)
    })
  }
  return [execute, submitting] as const
}
