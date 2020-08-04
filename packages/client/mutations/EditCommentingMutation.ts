import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {IRetroReflectionGroup} from '~/types/graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isAnonymous
    isCommenting
    meetingId
    preferredName
    threadId
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isAnonymous: Boolean!
    $isCommenting: Boolean!
    $meetingId: ID!
    $preferredName: String!
    $threadId: ID!
  ) {
    editCommenting(
      isAnonymous: $isAnonymous
      isCommenting: $isCommenting
      meetingId: $meetingId
      preferredName: $preferredName
      threadId: $threadId
    ) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  if (!payload) return
  const threadId = payload.getValue('threadId')
  const preferredName = payload.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
  if (!reflectionGroup) return
  const commentingNames = reflectionGroup.getValue('commentingNames')
  if (!isCommenting && !commentingNames) return

  if (isCommenting) {
    if (!commentingNames) {
      reflectionGroup.setValue([preferredName], 'commentingNames')
    } else {
      reflectionGroup.setValue([...commentingNames, preferredName], 'commentingNames')
    }
  } else {
    const filteredCommentingNames = commentingNames?.filter((id) => id !== preferredName)
    if (filteredCommentingNames?.length) {
      reflectionGroup.setValue(filteredCommentingNames, 'commentingNames')
    } else {
      reflectionGroup.setValue(null, 'commentingNames')
    }
  }
}

const EditCommentingMutation: StandardMutation<TEditCommentingMutation> = (
  atmosphere,
  variables
) => {
  return commitMutation<TEditCommentingMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default EditCommentingMutation
