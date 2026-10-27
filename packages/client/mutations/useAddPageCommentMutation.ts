import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import type {useAddPageCommentMutation as TuseAddPageCommentMutation} from '../__generated__/useAddPageCommentMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnPayloadError} from './handlers/snackOnPayloadError'

graphql`
  fragment useAddPageCommentMutation_notification on AddPageCommentSuccess {
    thread {
      id
      pageId
      ...PageThreadCard_thread
    }
  }
`

const mutation = graphql`
  mutation useAddPageCommentMutation(
    $pageId: ID!
    $content: String!
    $threadId: ID
    $anchor: PageThreadAnchorInput
  ) {
    addPageComment(pageId: $pageId, content: $content, threadId: $threadId, anchor: $anchor) {
      ...useAddPageCommentMutation_notification @relay(mask: false)
    }
  }
`

export const handleAddPageComment = (
  payload: RecordProxy,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const thread = payload.getLinkedRecord('thread')
  const page = thread && store.get(thread.getValue('pageId') as string)
  if (!thread || !page) return
  const threads = page.getLinkedRecords('threads') ?? []
  if (threads.some((existingThread) => existingThread.getDataID() === thread.getDataID())) return
  page.setLinkedRecords([...threads, thread], 'threads')
}

export const useAddPageCommentMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseAddPageCommentMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseAddPageCommentMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('addPageComment')
        if (payload) handleAddPageComment(payload, {store})
      },
      ...config,
      onCompleted: snackOnPayloadError(atmosphere, 'addPageCommentError', config.onCompleted)
    })
  }
  return [execute, submitting] as const
}
