import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {IRetroReflectionGroup, IAgendaItem} from '~/types/graphql'
import {StandardMutation, SharedUpdater} from '../types/relayMutations'
import {ThreadSourceEnum} from '~/types/graphql'
import createProxyRecord from '../utils/relay/createProxyRecord'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import handleEditCommenting from './handlers/handleEditCommenting'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isCommenting
    commenter {
      id
      preferredName
    }
    meetingId
    threadId
    threadSource
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isCommenting: Boolean!
    $meetingId: ID!
    $threadId: ID!
    $threadSource: ThreadSourceEnum!
  ) {
    editCommenting(
      isCommenting: $isCommenting
      meetingId: $meetingId
      threadId: $threadId
      threadSource: $threadSource
    ) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

const getNewCommenters = (commenters, {userId, preferredName}, isCommenting, store) => {
  console.log('getNewCommenters -> commenters', commenters)
  if (!commenters) return null
  const newCommenters = []
  if (isCommenting) {
    for (let ii = 0; ii < commenters.length; ii++) {
      const commenter = commenters[ii]
      if (commenter.getValue('userId') === userId) return
      newCommenters.push(commenter)
    }
    const newCommenter = createProxyRecord(store, 'CommenterDetails', {
      userId,
      preferredName
    })
    newCommenters.push(newCommenter)
  } else {
    for (let ii = 0; ii < commenters.length; ii++) {
      const commenter = commenters[ii]
      console.log('getNewCommenters -> ELSE ', commenter)
      console.log('getNewCommenters -> ELSE -> USERID', commenter.getValue('userId'), userId)
      if (commenter && commenter.getValue('userId') !== userId) {
        console.log('SHOULD NOT EXIST!')
        newCommenters.push(commenter)
      }
    }
  }
  return newCommenters
}

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  handleEditCommenting(payload, store)
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
