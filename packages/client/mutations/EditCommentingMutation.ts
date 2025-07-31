import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {EditCommentingMutation as TEditCommentingMutation} from '../__generated__/EditCommentingMutation.graphql'
import type {OptionalHandlers, StandardMutation} from '../types/relayMutations'

graphql`
  fragment EditCommentingMutation_meeting on EditCommentingSuccess {
    discussion {
      commentors {
        id
        preferredName
        __typename
      }
    }
  }
`

const mutation = graphql`
  mutation EditCommentingMutation($isCommenting: Boolean!, $discussionId: ID!) {
    editCommenting(isCommenting: $isCommenting, discussionId: $discussionId) {
      ...EditCommentingMutation_meeting @relay(mask: false)
      ... on ErrorPayload {
        error {
          message
        }
      }
    }
  }
`

const EditCommentingMutation: StandardMutation<TEditCommentingMutation, OptionalHandlers> = (
  atmosphere,
  variables
) => {
  return commitMutation<TEditCommentingMutation>(atmosphere, {
    mutation,
    variables
  })
}

export default EditCommentingMutation
