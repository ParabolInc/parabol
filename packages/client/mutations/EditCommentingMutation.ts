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
    preferredName
    threadId
    threadSource
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isAnonymous: Boolean!
    $isCommenting: Boolean!
    $meetingId: ID!
    $preferredName: String!
    $threadId: ID!
    $threadSource: ThreadSourceEnum!
  ) {
    editCommenting(
      isAnonymous: $isAnonymous
      isCommenting: $isCommenting
      meetingId: $meetingId
      preferredName: $preferredName
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
  if (!payload) return
  // const test = payload.getLinkedRecord('reflectionGroup')
  const threadId = payload.getValue('threadId')
  const preferredName = payload.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  // const threadId = store.getRootField('')
  const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
  // const test = reflectionGroup?.getLinkedRecords('commentingIds')
  if (!reflectionGroup) return
  const commentingIds = reflectionGroup.getValue('commentingIds')
  console.log('preferredName', preferredName, isCommenting, commentingIds)
  if (!isCommenting && !commentingIds) return
  if (isCommenting) {
    if (!commentingIds) {
      reflectionGroup.setValue(preferredName, 'commentingIds')
    }
    // reflectionGroup.setValue([...commentingIds, preferredName], 'commentingIds')
    // } else reflectionGroup.setValue([preferredName], 'commentingIds')
  } else {
    const filteredCommentingIds = commentingIds?.filter((id) => id !== preferredName)
    if (!filteredCommentingIds) reflectionGroup.setValue(null, 'commentingIds')
    else reflectionGroup.setValue(filteredCommentingIds, 'commentingIds')
  }
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
    variables

    //   const {isCommenting, preferredName, threadId} = variables
    //   if (!threadId) return
    //   const payload = store.get<IRetroReflectionGroup>(threadId)
    //   if (!payload) return
    //   if (isCommenting) {
    //     payload.setValue([preferredName], 'commentingIds')
    //   } else {
    //     payload.setValue(null, 'commentingIds')
    //   }
    //   // editCommentingMeetingUpdater(variables as any, {atmosphere, store})
    // }
    // onCompleted,
    // onError
  })
}

export default EditCommentingMutation
