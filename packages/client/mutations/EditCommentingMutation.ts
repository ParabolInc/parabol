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
const getNewCommentingIds = (
  commentingIds: string[] | undefined | null,
  commenterId: string,
  isCommenting: boolean
) => {
  if (isCommenting) {
    console.log('isCommenting', isCommenting)
    if (!commentingIds) {
      return [commenterId]
    } else {
      return [...commentingIds, commenterId]
    }
  } else {
    if (commentingIds && commentingIds.length > 1) {
      const newCommentingIds = commentingIds.filter((id) => id !== commenterId)
      return newCommentingIds
    }
  }
  return null
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
    const newCommenter = createProxyRecord(store, 'CommenterDetails', {
      // const newCommenter = [
      userId: commenterId,
      preferredName: preferredName
    })
    console.log('editCommentingMeetingUpdater -> newCommenter', newCommenter)
    reflectionGroup.setLinkedRecords([newCommenter], 'commenters')

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
