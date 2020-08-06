import createProxyRecord from '../../utils/relay/createProxyRecord'
import getInProxy from '../../utils/relay/getInProxy'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {ThreadSourceEnum} from '~/types/graphql'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import {IRetroReflectionGroup, IAgendaItem} from '~/types/graphql'

const getNewCommenters = (commenters, {userId, preferredName}, isCommenting, store) => {
  if (!commenters || (commenters.length === 1 && !isCommenting)) return null
  const newCommenters = [] as any
  for (let ii = 0; ii < commenters.length; ii++) {
    const commenter = commenters[ii]
    if (commenter.getValue('userId') !== userId) {
      newCommenters.push(commenter)
    }
  }
  if (isCommenting) {
    const newCommenter = createProxyRecord(store, 'CommenterDetails', {
      userId,
      preferredName
    })
    newCommenters.push(newCommenter)
  }
  return newCommenters
}

const handleEditTask = (payload, store) => {
  const threadId = payload.getValue('threadId')
  const commenter = payload.getLinkedRecord('commenter')
  const commenterId = commenter.getValue('id')
  const preferredName = commenter.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const threadSource = payload.getValue('threadSource')

  if (threadSource === ThreadSourceEnum.REFLECTION_GROUP) {
    const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
    if (!reflectionGroup) return
    const commenters = reflectionGroup.getLinkedRecords('commenters') || []
    const newCommenters = getNewCommenters(
      commenters,
      {userId: commenterId, preferredName},
      isCommenting,
      store
    )
    if (newCommenters) {
      reflectionGroup.setLinkedRecords(newCommenters, 'commenters')
    } else {
      reflectionGroup.setValue(null, 'commenters')
    }
  } else if (threadSource === ThreadSourceEnum.AGENDA_ITEM) {
    const agendaItem = store.get<IAgendaItem>(threadId)
    if (!agendaItem) return
    const commenters = agendaItem.getLinkedRecords('commenters') || []
    const newCommenters = getNewCommenters(
      commenters,
      {userId: commenterId, preferredName},
      isCommenting,
      store
    )
    if (newCommenters) {
      agendaItem.setLinkedRecords(newCommenters, 'commenters')
    } else {
      agendaItem.setValue(null, 'commenters')
    }
  }
}

export default handleEditTask
