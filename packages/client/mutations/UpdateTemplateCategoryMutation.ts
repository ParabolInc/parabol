import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import type {UpdateTemplateCategoryMutation as TUpdateTemplateCategoryMutation} from '../__generated__/UpdateTemplateCategoryMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

graphql`
  fragment UpdateTemplateCategoryMutation_team on UpdateTemplateCategoryPayload {
    template {
      category
    }
  }
`

const mutation = graphql`
  mutation UpdateTemplateCategoryMutation($templateId: ID!, $mainCategory: String!) {
    updateTemplateCategory(templateId: $templateId, mainCategory: $mainCategory) {
      ...UpdateTemplateCategoryMutation_team @relay(mask: false) @alias
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
      // allow components to override default handlers
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useTemplateCategoryMutation
