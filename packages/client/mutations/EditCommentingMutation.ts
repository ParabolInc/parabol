import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {SimpleMutation} from '../types/relayMutations'
import {IDiscussPhase} from '~/types/graphql'
import {RecordProxy} from 'relay-runtime'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isAnonymous
    isCommenting
    threadId
    threadSource
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isAnonymous: Boolean!
    $isCommenting: Boolean!
    $threadId: ID!
    $threadSource: ThreadSourceEnum!
  ) {
    editCommenting(
      isAnonymous: $isAnonymous
      isCommenting: $isCommenting
      threadId: $threadId
      threadSource: $threadSource
    ) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

const EditCommentingMutation = (atmosphere, variables) => {
  console.log('MUTATING')
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {threadId} = variables
      console.log('EditCommentingMutation -> threadId', threadId)
      // if (!checkInQuestion) return
      // const meeting = store.get<INewMeeting>(meetingId)
      // // if (!meeting) return
      // const phases = meeting.getLinkedRecords('phases')
      // const discussPhase = phases.find(
      //   (phase) => phase.getValue('__typename') === 'DiscussPhase'
      // ) as RecordProxy<IDiscussPhase>
      // discussPhase.setValue('LALLALALA', 'commentingIds')
    }
  })
}

export default EditCommentingMutation
