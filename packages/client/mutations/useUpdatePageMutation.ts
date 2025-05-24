import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import {useUpdatePageMutation as TuseUpdatePageMutation} from '../__generated__/useUpdatePageMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useUpdatePageMutation_payload on UpdatePagePayload {
    page {
      sortOrder
      teamId
      parentPageId
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageMutation(
    $pageId: ID!
    $sortOrder: String!
    $parentPageId: ID
    $teamId: ID
  ) {
    updatePage(
      pageId: $pageId
      sortOrder: $sortOrder
      parentPageId: $parentPageId
      teamId: $teamId
    ) {
      ...useUpdatePageMutation_payload @relay(mask: false)
    }
  }
`

export const useUpdatePageMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseUpdatePageMutation>(mutation)
  const execute = (
    config: UseMutationConfig<TuseUpdatePageMutation> & {
      pageId: string
      oldParentPageId?: string | null
      newParentPageId?: string | null
    }
  ) => {
    const {pageId, oldParentPageId, newParentPageId, ...rest} = config
    return commit({
      updater: (store) => {
        const payload = store.getRootField('updatePage')
        if (!payload) return
        const connParent = store.get(atmosphere.viewerId)!
        const sourceConn = ConnectionHandler.getConnection(connParent!, 'User_pages', {
          parentPageId: oldParentPageId
        })!
        ConnectionHandler.deleteNode(sourceConn, pageId)

        const targetConn = ConnectionHandler.getConnection(connParent!, 'User_pages', {
          parentPageId: newParentPageId
        })
        if (!targetConn) {
          // is the target is not expanded, no connection exists yet
          return
        }
        const newPage = payload.getLinkedRecord('page')
        const {sortOrder} = config.variables
        const newEdge = ConnectionHandler.createEdge(store, targetConn, newPage, 'PageEdge')
        newEdge.setValue(sortOrder, 'cursor')
        const edges = targetConn.getLinkedRecords<[{cursor: string}]>('edges')!
        const nextIdx = edges.findIndex((edge) => edge.getValue('cursor') > sortOrder)
        const safeNextIdx = nextIdx === -1 ? edges.length : nextIdx
        const nextEdges = [...edges.slice(0, safeNextIdx), newEdge, ...edges.slice(safeNextIdx)]
        targetConn.setLinkedRecords(nextEdges, 'edges')
      },
      ...rest
    })
  }
  return [execute, submitting] as const
}
