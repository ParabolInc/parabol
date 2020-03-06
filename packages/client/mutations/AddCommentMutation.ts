import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ThreadSourceEnum} from 'types/graphql'
import makeEmptyStr from 'utils/draftjs/makeEmptyStr'
import createProxyRecord from 'utils/relay/createProxyRecord'
import {AddCommentMutation_meeting} from '__generated__/AddCommentMutation_meeting.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {AddCommentMutation as TAddCommentMutation} from '../__generated__/AddCommentMutation.graphql'
import getReflectionGroupThreadConn from './connections/getReflectionGroupThreadConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment AddCommentMutation_meeting on AddCommentSuccess {
    comment {
      ...ThreadedComment_comment
      threadSource
      threadId
      threadSortOrder
    }
  }
`

const mutation = graphql`
  mutation AddCommentMutation($comment: AddCommentInput!) {
    addComment(comment: $comment) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AddCommentMutation_meeting @relay(mask: false)
    }
  }
`

export const addCommentMeetingUpdater: SharedUpdater<AddCommentMutation_meeting> = (
  payload,
  {store}
) => {
  const comment = payload.getLinkedRecord('comment')
  if (!comment) return
  const threadSource = comment.getValue('threadSource')
  const reflectionGroupId =
    threadSource === ThreadSourceEnum.REFLECTION_GROUP ? comment.getValue('threadId') : undefined
  if (reflectionGroupId) {
    const reflectionGroup = (reflectionGroupId && store.get(reflectionGroupId as string)) || null
    const reflectionGroupConn = getReflectionGroupThreadConn(reflectionGroup)
    safePutNodeInConn(reflectionGroupConn, comment, store, 'threadSortOrder', true)
  }
}

const AddCommentMutation: StandardMutation<TAddCommentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAddCommentMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addComment')
      addCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    optimisticUpdater: (store) => {
      const {viewerId} = atmosphere
      const {comment} = variables
      const now = new Date().toJSON()
      const viewer = store.getRoot().getLinkedRecord('viewer')
      const optimisticComment = createProxyRecord(store, 'Comment', {
        ...comment,
        createdAt: now,
        updatedAt: now,
        createdBy: viewerId,
        comtent: comment.content || makeEmptyStr(),
        isViewerComment: true,
        reactjis: []
      })
        .setLinkedRecord(store.get(viewerId)!, 'user')
        .setLinkedRecord(viewer, 'createdByUser')
        .setLinkedRecords([], 'reactjis')
      const payload = createProxyRecord(store, 'payload', {})
      payload.setLinkedRecord(optimisticComment, 'comment')
      addCommentMeetingUpdater(payload as any, {atmosphere, store})
    },
    onCompleted,
    onError
  })
}

export default AddCommentMutation
