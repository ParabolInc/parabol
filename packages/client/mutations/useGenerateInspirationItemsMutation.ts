import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useGenerateInspirationItemsMutation as TGenerateInspirationItemsMutation} from '../__generated__/useGenerateInspirationItemsMutation.graphql'

const mutation = graphql`
  mutation useGenerateInspirationItemsMutation($input: GenerateInspirationItemsInput!) {
    generateInspirationItems(input: $input) {
      meeting {
        id
      }
      inspirationItems {
        id
        content
        title
        service
        promptId
        createdAt
      }
    }
  }
`

const useGenerateInspirationItemsMutation = () => {
  const [commit, submitting] = useMutation<TGenerateInspirationItemsMutation>(mutation)
  const execute = (config: UseMutationConfig<TGenerateInspirationItemsMutation>) => {
    const {service} = config.variables.input
    return commit({
      updater: (store) => {
        // Keep the cached `inspirationItems(service)` field in sync so re-opening the drawer
        // shows the latest generation without a refetch.
        const payload = store.getRootField('generateInspirationItems')
        if (!payload) return
        const items = payload.getLinkedRecords('inspirationItems')
        const meeting = payload.getLinkedRecord('meeting')
        if (!meeting || !items) return
        meeting.setLinkedRecords(items, 'inspirationItems', {service})
      },
      // allow components to override default config
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useGenerateInspirationItemsMutation
