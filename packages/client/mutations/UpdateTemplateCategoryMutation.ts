import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment UpdateTemplateCategoryMutation_team on UpdateTemplateCategorySuccess {
    template {
      category
    }
  }
`

graphql`
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
