import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import type {useDeletePageCommentMutation as TuseDeletePageCommentMutation} from '../__generated__/useDeletePageCommentMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnPayloadError} from './handlers/snackOnPayloadError'

graphql`
  fragment useDeletePageCommentMutation_notification on DeletePageCommentSuccess {
    comment {
      id
    }
    thread {
      id
      pageId
      comments {
        id
      }
    }
  }
`

const mutation = graphql`
  mutation useDeletePageCommentMutation($commentId: ID!) {
    deletePageComment(commentId: $commentId) {
      ...useDeletePageCommentMutation_notification @relay(mask: false)
    }
  }
`

export const handleDeletePageComment = (
  payload: RecordProxy,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const thread = payload.getLinkedRecord('thread')
  if (!thread || thread.getLinkedRecords('comments')?.length) return
  const threadId = thread.getDataID()
  const page = store.get(thread.getValue('pageId') as string)
  const threads = page?.getLinkedRecords('threads') ?? []
  page?.setLinkedRecords(
    threads.filter((existingThread) => existingThread.getDataID() !== threadId),
    'threads'
  )
}

export const useDeletePageCommentMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseDeletePageCommentMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseDeletePageCommentMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('deletePageComment')
        if (payload) handleDeletePageComment(payload, {store})
      },
      ...config,
      onCompleted: snackOnPayloadError(atmosphere, 'deletePageCommentError', config.onCompleted)
    })
  }
  return [execute, submitting] as const
}
