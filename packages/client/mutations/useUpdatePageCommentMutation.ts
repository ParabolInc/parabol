import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePageCommentMutation as TuseUpdatePageCommentMutation} from '../__generated__/useUpdatePageCommentMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnPayloadError} from './handlers/snackOnPayloadError'

graphql`
  fragment useUpdatePageCommentMutation_notification on UpdatePageCommentSuccess {
    comment {
      ...PageCommentItem_comment
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageCommentMutation($commentId: ID!, $content: String!) {
    updatePageComment(commentId: $commentId, content: $content) {
      ...useUpdatePageCommentMutation_notification @relay(mask: false)
    }
  }
`

export const useUpdatePageCommentMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseUpdatePageCommentMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageCommentMutation>) => {
    return commit({
      ...config,
      onCompleted: snackOnPayloadError(atmosphere, 'updatePageCommentError', config.onCompleted)
    })
  }
  return [execute, submitting] as const
}
