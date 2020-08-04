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
    meetingId
    preferredName
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
    $preferredName: String!
    $threadId: ID!
    $threadSource: ThreadSourceEnum!
  ) {
    editCommenting(
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
const getNewCommentingNames = (
  commentingNames: string[] | undefined | null,
  preferredName: string,
  isCommenting: boolean
) => {
  if (isCommenting) {
    if (!commentingNames) {
      return [preferredName]
    } else {
      return [...commentingNames, preferredName]
    }
  } else {
    if (!commentingNames || commentingNames.length <= 1) {
      return null
    } else {
      return commentingNames.filter((name) => name !== preferredName)
    }
  }
}

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  console.log('Updater!')
  if (!payload) return
  const threadId = payload.getValue('threadId')
  const preferredName = payload.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const threadSource = payload.getValue('threadSource')
  console.log('threadSource', threadSource)
  console.log('ThreadSourceEnum.AGENDA_ITEM', ThreadSourceEnum.AGENDA_ITEM)

  if (threadSource === ThreadSourceEnum.REFLECTION_GROUP) {
    const reflectionGroup = store.get<IRetroReflectionGroup>(threadId)
    if (!reflectionGroup) return
    const commentingNames = reflectionGroup.getValue('commentingNames')
    if (!isCommenting && !commentingNames) return
    const newCommentingNames = getNewCommentingNames(commentingNames, preferredName, isCommenting)
    reflectionGroup.setValue(newCommentingNames, 'commentingNames')
  } else if (threadSource === ThreadSourceEnum.AGENDA_ITEM) {
    const agendaItem = store.get<IAgendaItem>(threadId)
    if (!agendaItem) return
    const commentingNames = agendaItem.getValue('commentingNames')
    if (!isCommenting && !commentingNames) return
    const newCommentingNames = getNewCommentingNames(commentingNames, preferredName, isCommenting)
    agendaItem.setValue(newCommentingNames, 'commentingNames')
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
