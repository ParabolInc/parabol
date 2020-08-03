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
      const {threadId} = variables
      // if (!checkInQuestion) return
      const thread = store.get<IRetroReflectionGroup>(threadId)
      if (!thread) return
      const reflections = thread.getLinkedRecords('reflections')
      const test = reflections?.map((reflection) => {
        console.log('EditCommentingMutation -> reflection', reflection)
        const secondTest = reflection.getValue('commentingIds')
        // const secondTest = reflection.getValue('id')
        console.log('EditCommentingMutation -> secondTest', secondTest, threadId)
        return secondTest
      })
      // const discussPhase = phases.find(
      //   (phase) => phase.getValue('__typename') === 'DiscussPhase'
      // ) as RecordProxy<IDiscussPhase>
      // discussPhase.setValue('LALLALALA', 'commentingIds')
    }
  })
}

export default EditCommentingMutation
