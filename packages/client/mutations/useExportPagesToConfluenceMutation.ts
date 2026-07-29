import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useExportPagesToConfluenceMutation as TExportPagesToConfluenceMutation} from '../__generated__/useExportPagesToConfluenceMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useExportPagesToConfluenceMutation_pageExport on PageExport {
    id
    status
    cloudId
    spaceId
    spaceName
    includeSubPages
    rootTargetUrl
    createdAt
    errorSummary
    pages {
      pageId
      title
      depth
      status
      targetUrl
      error
    }
  }
`

const mutation = graphql`
  mutation useExportPagesToConfluenceMutation(
    $pageId: ID!
    $teamId: ID!
    $includeSubPages: Boolean!
    $cloudId: ID!
    $spaceId: ID!
    $spaceName: String!
    $targetParentPageId: ID
  ) {
    exportPagesToConfluence(
      pageId: $pageId
      teamId: $teamId
      includeSubPages: $includeSubPages
      cloudId: $cloudId
      spaceId: $spaceId
      spaceName: $spaceName
      targetParentPageId: $targetParentPageId
    ) {
      pageExport {
        ...useExportPagesToConfluenceMutation_pageExport @relay(mask: false)
      }
    }
  }
`

const useExportPagesToConfluenceMutation = () => {
  const [commit, submitting] = useMutation<TExportPagesToConfluenceMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TExportPagesToConfluenceMutation>) => {
    return commit({
      onError: (error) => {
        atmosphere.eventEmitter.emit('addSnackbar', {
          message: error.message,
          autoDismiss: 8,
          key: 'exportPagesToConfluenceError'
        })
      },
      // allow components to override default handlers
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useExportPagesToConfluenceMutation
