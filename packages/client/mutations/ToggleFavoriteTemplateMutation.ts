import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {ToggleFavoriteTemplateMutation as TToggleFavoriteTemplateMutation} from '../__generated__/ToggleFavoriteTemplateMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment ToggleFavoriteTemplateMutation_viewer on ToggleFavoriteTemplateSuccess {
    user {
      id
      ...ActivityCardFavorite_user
    }
  }
`

const mutation = graphql`
  mutation ToggleFavoriteTemplateMutation($templateId: ID!) {
    toggleFavoriteTemplate(templateId: $templateId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...ToggleFavoriteTemplateMutation_viewer @relay(mask: false)
    }
  }
`

const ToggleFavoriteTemplateMutation: StandardMutation<TToggleFavoriteTemplateMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TToggleFavoriteTemplateMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default ToggleFavoriteTemplateMutation
