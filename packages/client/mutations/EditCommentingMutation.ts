import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {IRetroReflectionGroup, IAgendaItem} from '~/types/graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import {ThreadSourceEnum} from '~/types/graphql'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isCommenting
    commentorId
    meetingId
    threadId
    threadSource
  }
`

// Variable '$threadSource' was defined as type 'ThreadSourceEnum' but used in a location expecting the type 'ThreadSourceEnum!'
// Watching for changes to js/ts/tsx...

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
  viewerId: string,
  isCommenting: boolean
) => {
  if (isCommenting) {
    console.log('isCommenting', isCommenting)
    if (!commentingIds) {
      return [viewerId]
    } else {
      return [...commentingIds, viewerId]
    }
  } else {
    if (commentingIds && commentingIds.length > 1) {
      // remove first occurrance of name as two users could have same name
      // const nameIndex = commentingIds.findIndex((name) => name === viewerId)
      // const newCommentingIds = commentingIds.map((name) => name)
      // newCommentingIds.splice(nameIndex, 1)
      const newCommentingIds = commentingIds.filter((id) => id !== viewerId)
      return newCommentingIds
    }
  }
  return null
}

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  console.log('Updater!')
  if (!payload) return
  const threadId = payload.getValue('threadId')
  const viewerId = payload.getValue('commentorId')
  console.log('updater --> viewerId', viewerId)
  const isCommenting = payload.getValue('isCommenting')
  const threadSource = payload.getValue('threadSource')
  const test = payload.getValue('test')
  console.log('test', test)

  if (threadSource === ThreadSourceEnum.REFLECTION_GROUP) {
    const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
    if (!reflectionGroup) return
    const commentingIds = reflectionGroup.getValue('commentingIds')
    console.log('commentingIds', commentingIds)
    if (!isCommenting && !commentingIds) return
    const newCommentingIds = getNewCommentingIds(commentingIds, viewerId, isCommenting)
    console.log('newCommentingIds', newCommentingIds)
    reflectionGroup.setValue(newCommentingIds, 'commentingIds')
  } else if (threadSource === ThreadSourceEnum.AGENDA_ITEM) {
    const agendaItem = store.get<IAgendaItem>(threadId)
    if (!agendaItem) return
    const commentingIds = agendaItem.getValue('commentingIds')
    if (!isCommenting && !commentingIds) return
    const newCommentingIds = getNewCommentingIds(commentingIds, viewerId, isCommenting)
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
