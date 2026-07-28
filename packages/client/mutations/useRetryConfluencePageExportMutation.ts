import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRetryConfluencePageExportMutation as TRetryConfluencePageExportMutation} from '../__generated__/useRetryConfluencePageExportMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

const mutation = graphql`
  mutation useRetryConfluencePageExportMutation($pageExportId: ID!, $pageId: ID!) {
    retryConfluencePageExport(pageExportId: $pageExportId, pageId: $pageId) {
      pageExport {
        ...useExportPagesToConfluenceMutation_pageExport @relay(mask: false)
      }
    }
  }
`

const useRetryConfluencePageExportMutation = () => {
  const [commit, submitting] = useMutation<TRetryConfluencePageExportMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TRetryConfluencePageExportMutation>) => {
    return commit({
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 8,
          key: 'retryConfluencePageExportError'
        })
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useRetryConfluencePageExportMutation
