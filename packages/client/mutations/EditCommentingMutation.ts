import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'
import {IDiscussPhase, IRetroReflection, IRetroReflectionGroup} from '~/types/graphql'
import {RecordProxy} from 'relay-runtime'
import getThreadSourceThreadConn from './connections/getThreadSourceThreadConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import Atmosphere from '~/Atmosphere'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isAnonymous
    isCommenting
    meetingId
    threadId
    threadSource
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isAnonymous: Boolean!
    $isCommenting: Boolean!
    $meetingId: ID!
    $threadId: ID!
    $threadSource: ThreadSourceEnum!
  ) {
    editCommenting(
      isAnonymous: $isAnonymous
      isCommenting: $isCommenting
      meetingId: $meetingId
      threadId: $threadId
      threadSource: $threadSource
    ) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  // const {viewerId} = atmosphere
  // const {viewerId} = store.
  // payload.getLinkedRecord('threadId')
  // console.log('IN viewerId', viewerId)
  if (!payload) return
  // const test = payload.getLinkedRecord('reflectionGroup')
  const threadId = payload.getValue('threadId')
  const isCommenting = payload.getValue('isCommenting')
  // const threadId = store.getRootField('')
  console.log('threadId', threadId)
  const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
  // const test = reflectionGroup?.getLinkedRecords('commentingIds')
  console.log('reflectionGroup', reflectionGroup)
  if (!reflectionGroup) return
  const commentingIds = reflectionGroup.getValue('commentingIds')
  console.log('commentingIds', commentingIds)
  if (!isCommenting && !commentingIds) return
  if (isCommenting) {
    // if (!commentingIds) reflectionGroup.setValue('DAVE', 'commentingIds')
    // else reflectionGroup.setValue([...commentingIds, 'LUCY'], 'commentingIds')
    if (commentingIds) reflectionGroup.setValue([...commentingIds, 'JULIE'], 'commentingIds')
    else reflectionGroup.setValue(['DAVE'], 'commentingIds')
  } else {
    const filteredCommentingIds = commentingIds?.filter((id) => id !== 'DAVE')
    if (!filteredCommentingIds) reflectionGroup.setValue(null, 'commentingIds')
    else reflectionGroup.setValue(filteredCommentingIds, 'commentingIds')
  }
  // const updatedCommentingIds = commentingIds ? [...commentingIds, viewerId] : [viewerId]
  // if (!oldCommentingIds && isCommenting) payload.setValue([viewerId], 'commentingIds')
  // else if (isCommenting) payload.setValue([...oldCommentingIds, viewerId], 'commentingIds')
  // else {
  //   const filteredCommentingIds = oldCommentingIds?.filter((id) => id !== viewerId)
  //   console.log('EditCommentingMutation -> filteredCommentingIds', filteredCommentingIds)
  //   payload.setValue(filteredCommentingIds, 'commentingIds')
  // }

  // const threadSourceProxy = (threadId && store.get(threadId as string)) || null
  // const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
  // console.log('threadSourceConn', threadSourceConn)
  // safePutNodeInConn(threadSourceConn, payload, store, 'threadSortOrder', true)

  // const comment = payload.getLinkedRecord('comment')
  // if (!comment) return
  // const threadParentId = comment.getValue('threadParentId')
  // if (threadParentId) {
  //   addNodeToArray(comment, store.get(threadParentId), 'replies', 'threadSortOrder')
  //   return
  // }
  // const threadSourceId = comment.getValue('threadId')
  // if (threadSourceId) {
  //   const threadSourceProxy = (threadSourceId && store.get(threadSourceId as string)) || null
  //   const threadSourceConn = getThreadSourceThreadConn(threadSourceProxy)
  //   safePutNodeInConn(threadSourceConn, comment, store, 'threadSortOrder', true)
  // }
}

// const EditCommentingMutation = (atmosphere, variables) => {
// return commitMutation(atmosphere, {
const EditCommentingMutation: StandardMutation<TEditCommentingMutation> = (
  atmosphere,
  variables
  // {onError, onCompleted}
) => {
  return commitMutation<TEditCommentingMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {threadId} = variables
      if (!threadId) return
      // const payload = store.getRootField('editCommenting')
      const payload = store.get<IRetroReflectionGroup>(threadId)
      if (!payload) return
      const {isCommenting} = variables
      if (isCommenting) {
        payload.setValue(['BRAVO'], 'commentingIds')
      } else {
        payload.setValue(null, 'commentingIds')
      }
      // editCommentingMeetingUpdater(variables as any, {atmosphere, store})
    }
    // onCompleted,
    // onError
  })
}

export default EditCommentingMutation
