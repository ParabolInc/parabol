import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import {UpdateTemplateCategoryMutation as TUpdateTemplateCategoryMutation} from '../__generated__/UpdateTemplateCategoryMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

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

const useTemplateCategoryMutation = () => {
  const [commit, submitting] = useMutation<TUpdateTemplateCategoryMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute: typeof commit = (config) => {
    const {variables} = config
    const {templateId, mainCategory} = variables
    return commit({
      optimisticUpdater: (store) => {
        const template = store.get(templateId)
        template?.setValue(mainCategory, 'mainCategory')
      },
      onCompleted: (res) => {
        const message = res.updateTemplateCategory.error?.message
        message &&
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'updateCategory',
            message,
            autoDismiss: 5
          })
      },
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useTemplateCategoryMutation
