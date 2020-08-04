import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import {IRetroReflectionGroup, IAgendaItem} from '~/types/graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    isCommenting
    meetingId
    preferredName
    reflectionGroupId
  }
`

const mutation = graphql`
  mutation EditCommentingMutation(
    $isCommenting: Boolean!
    $meetingId: ID!
    $preferredName: String!
    $reflectionGroupId: ID!
  ) {
    editCommenting(
      isCommenting: $isCommenting
      meetingId: $meetingId
      preferredName: $preferredName
      reflectionGroupId: $reflectionGroupId
    ) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

export const editCommentingMeetingUpdater: SharedUpdater<EditCommentingMutation_meeting> = (
  payload,
  {store}
) => {
  console.log('Updater!')
  if (!payload) return
  const reflectionGroupId = payload.getValue('reflectionGroupId')
  const preferredName = payload.getValue('preferredName')
  const isCommenting = payload.getValue('isCommenting')
  const reflectionGroup = store.get<IRetroReflectionGroup>(reflectionGroupId)
  const reflectionGroupDos = store.get<IAgendaItem>(reflectionGroupId)
  console.log('reflectionGroupDos', reflectionGroupDos)
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
    const filteredCommentingNames = commentingNames?.filter((name) => name !== preferredName)
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
  console.log('in mutttttation')
  return commitMutation<TEditCommentingMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default EditCommentingMutation
