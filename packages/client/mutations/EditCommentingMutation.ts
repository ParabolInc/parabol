import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {EditCommentingMutation_meeting} from '~/__generated__/EditCommentingMutation_meeting.graphql'
import {SharedUpdater, StandardMutation} from '../types/relayMutations'
import {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import handleEditCommenting from './handlers/handleEditCommenting'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingPayload {
    commentor {
      id
      preferredName
    }
    isCommenting
    discussionId
  }
`

const mutation = graphql`
  mutation EditCommentingMutation($isCommenting: Boolean!, $discussionId: ID!) {
    editCommenting(isCommenting: $isCommenting, discussionId: $discussionId) {
      ...EditCommentingMutation_meeting @relay(mask: false)
    }
  }
`

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
