import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {IRetroReflectionGroup, IAgendaItem} from '~/types/graphql'
import {StandardMutation} from '../types/relayMutations'
import {ThreadSourceEnum} from '~/types/graphql'
import createProxyRecord from '../utils/relay/createProxyRecord'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isCommenting
    # commenterId
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
// const getNewCommentingIds = (
//   commentingIds: string[] | undefined | null,
//   commenterId: string,
//   isCommenting: boolean
// ) => {
//   if (isCommenting) {
//     console.log('isCommenting', isCommenting)
//     if (!commentingIds) {
//       return [commenterId]
//     } else {
//       return [...commentingIds, commenterId]
//     }
//   } else {
//     if (commentingIds && commentingIds.length > 1) {
//       const newCommentingIds = commentingIds.filter((id) => id !== commenterId)
//       return newCommentingIds
//     }
//   }
//   return null
// }

const getNewCommenters = (commenters, {userId, preferredName}, isCommenting, store) => {
  const newCommenters = []
  if (isCommenting) {
    // handle multiple socket connections
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
      if (commenter && commenter.getValue('userId') !== userId) {
        newCommenters.push(commenter)
      }
    }
  }
  return newCommenters
}

export const editCommentingMeetingUpdater = (payload, {store}) => {
  if (!payload) return
  const threadId = payload.getValue('threadId')
  const commenter = payload.getLinkedRecord('commenter')
  const commenterId = commenter.getValue('id')
  const preferredName = commenter.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const threadSource = payload.getValue('threadSource')

  if (threadSource === ThreadSourceEnum.REFLECTION_GROUP) {
    const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
    console.log('editCommentingMeetingUpdater -> reflectionGroup', reflectionGroup)
    if (!reflectionGroup) return
    const commenters = reflectionGroup.getLinkedRecords('commenters')
    console.log('editCommentingMeetingUpdater -> commenters', commenters)
    // if (!isCommenting && !commentingIds) return
    // const newCommentingIds = getNewCommentingIds(commentingIds, commenterId, isCommenting)
    // const newCommenter = createProxyRecord(store, 'CommenterDetails', {
    //   userId: commenterId,
    //   preferredName: preferredName
    // })
    // console.log('editCommentingMeetingUpdater -> newCommenter', newCommenter)
    const newCommenters = getNewCommenters(
      commenters,
      {userId: commenterId, preferredName},
      isCommenting,
      store
    )
    console.log('editCommentingMeetingUpdater -> newCommenters', newCommenters)
    reflectionGroup.setLinkedRecords(newCommenters, 'commenters')

    console.log('AFTER ')
    // reflectionGroup.setValue(newCommentingIds, 'commentingIds')
  } else if (threadSource === ThreadSourceEnum.AGENDA_ITEM) {
    const agendaItem = store.get<IAgendaItem>(threadId)
    if (!agendaItem) return
    const commentingIds = agendaItem.getValue('commentingIds')
    if (!isCommenting && !commentingIds) return
    const newCommentingIds = getNewCommentingIds(commentingIds, commenterId, isCommenting)
    agendaItem.setValue(newCommentingIds, 'commentingIds')
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
