import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {IComment} from '~/types/graphql'
import {StandardMutation} from '../types/relayMutations'
import {UpdateCommentContentMutation as TUpdateCommentContentMutation} from '../__generated__/UpdateCommentContentMutation.graphql'

graphql`
  fragment UpdateCommentContentMutation_meeting on UpdateCommentContentSuccess {
    comment {
      id
      content
      updatedAt
    }
  }
`

const mutation = graphql`
  mutation UpdateCommentContentMutation($commentId: ID!, $content: String!, $meetingId: ID!) {
    updateCommentContent(commentId: $commentId, content: $content, meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateCommentContentMutation_meeting @relay(mask: false)
    }
  }
`

const UpdateCommentContentMutation: StandardMutation<TUpdateCommentContentMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateCommentContentMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {commentId, content} = variables
      const comment = store.get<IComment>(commentId)
      if (!comment) return
      const now = new Date().toJSON()
      comment.setValue(content, 'content')
      comment.setValue(now, 'updatedAt')
    },
    onError,
    onCompleted
  })
}

export default UpdateCommentContentMutation
