import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'
import {IDiscussPhase, IRetroReflection, IRetroReflectionGroup} from '~/types/graphql'
import {RecordProxy} from 'relay-runtime'

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

const EditCommentingMutation = (atmosphere, variables) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {viewerId} = atmosphere
      const {isCommenting, threadId} = variables
      // if (!checkInQuestion) return
      const thread = store.get<IRetroReflectionGroup>(threadId)
      if (!thread) return
      const oldCommentingIds = thread.getValue('commentingIds')
      if (!oldCommentingIds && isCommenting) thread.setValue([viewerId], 'commentingIds')
      else if (isCommenting) thread.setValue([...oldCommentingIds, viewerId], 'commentingIds')
      else {
        const filteredCommentingIds = oldCommentingIds?.filter((id) => id !== viewerId)
        console.log('EditCommentingMutation -> filteredCommentingIds', filteredCommentingIds)
        thread.setValue(filteredCommentingIds, 'commentingIds')
      }
    }
  })
}

export default EditCommentingMutation
