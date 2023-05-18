import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {UpdateTemplateCategoryMutation as TUpdateTemplateCategoryMutation} from '../__generated__/UpdateTemplateCategoryMutation.graphql'
import {OptionalHandlers, StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateTemplateCategoryMutation_team on UpdateTemplateCategorySuccess {
    template {
      category
    }
  }
`

const mutation = graphql`
  mutation UpdateTemplateCategoryMutation($templateId: ID!, $mainCategory: String!) {
    updateTemplateCategory(templateId: $templateId, mainCategory: $mainCategory) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateTemplateCategoryMutation_team @relay(mask: false)
    }
  }
`
const UpdateTemplateCategoryMutation: StandardMutation<
  TUpdateTemplateCategoryMutation,
  OptionalHandlers
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TUpdateTemplateCategoryMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {templateId, mainCategory} = variables
      const template = store.get(templateId)
      template?.setValue(mainCategory, 'mainCategory')
    },
    onCompleted,
    onError
  })
}

export default UpdateTemplateCategoryMutation
