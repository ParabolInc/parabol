import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {useUpdatePageMutation as TuseUpdatePageMutation} from '../__generated__/useUpdatePageMutation.graphql'
import type {PageConnectionKey} from '../components/DashNavList/LeftNavPageLink'
import useAtmosphere from '../hooks/useAtmosphere'

graphql`
  fragment useUpdatePageMutation_payload on UpdatePagePayload {
    page {
      sortOrder
      teamId
      parentPageId
      isPrivate
      isParentLinked
      # TODO: remove and verify that this value isn't cached, since it will go stale
      ...PageSharingAccessList_pageAccess @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageMutation(
    $pageId: ID!
    $sortOrder: String!
    $parentPageId: ID
    $teamId: ID
    $makePrivate: Boolean
  ) {
    updatePage(
      pageId: $pageId
      sortOrder: $sortOrder
      parentPageId: $parentPageId
      teamId: $teamId
      makePrivate: $makePrivate
    ) {
      ...useUpdatePageMutation_payload @relay(mask: false)
    }
  }
`

export const isPrivatePageConnectionLookup = {
  User_privatePages: true,
  User_sharedPages: false
} as Record<PageConnectionKey, boolean>

export const putPageInConn = (
  store: RecordSourceSelectorProxy,
  targetConn: RecordProxy,
  page: RecordProxy<{sortOrder: string}>
) => {
  const sortOrder = page.getValue('sortOrder')
  const newEdge = ConnectionHandler.createEdge(store, targetConn, page, 'PageEdge')
  newEdge.setValue(sortOrder, 'cursor')
  const edges = targetConn.getLinkedRecords<[{cursor: string}]>('edges')!
  const nextIdx = edges.findIndex((edge) => edge.getValue('cursor') > sortOrder)
  const safeNextIdx = nextIdx === -1 ? edges.length : nextIdx
  const nextEdges = [...edges.slice(0, safeNextIdx), newEdge, ...edges.slice(safeNextIdx)]
  targetConn.setLinkedRecords(nextEdges, 'edges')
}
export const useUpdatePageMutation = () => {
  const atmosphere = useAtmosphere()
  const [commit, submitting] = useMutation<TuseUpdatePageMutation>(mutation)
  const execute = (
    config: UseMutationConfig<TuseUpdatePageMutation> & {
      sourceConnectionKey: PageConnectionKey
      targetConnectionKey: PageConnectionKey
      sourceParentPageId?: string | null
      sourceTeamId?: string | null
    }
  ) => {
    const {
      sourceConnectionKey,
      targetConnectionKey,
      sourceParentPageId,
      sourceTeamId,
      variables,
      ...rest
    } = config
    const {parentPageId: targetParentPageId, teamId: targetTeamId, pageId} = variables
    return commit({
      updater: (store) => {
        const {viewerId} = atmosphere
        const payload = store.getRootField('updatePage')
        if (!payload) return
        const newPage = payload.getLinkedRecord('page')

        const sourceParent = store.get(sourceTeamId || viewerId)!
        const targetParent = store.get(targetTeamId || viewerId)!
        const isSourcePrivate = isPrivatePageConnectionLookup[sourceConnectionKey]
        const isTargetPrivate = isPrivatePageConnectionLookup[targetConnectionKey]
        const sourceConn = ConnectionHandler.getConnection(sourceParent!, sourceConnectionKey, {
          parentPageId: sourceParentPageId || undefined,
          teamId: sourceTeamId || undefined,
          isPrivate: isSourcePrivate
        })!
        ConnectionHandler.deleteNode(sourceConn, pageId)

        const targetConn = ConnectionHandler.getConnection(targetParent!, targetConnectionKey, {
          parentPageId: targetParentPageId || undefined,
          teamId: targetTeamId || undefined,
          isPrivate: isTargetPrivate
        })
        if (!targetConn) {
          // is the target is not expanded, no connection exists yet
          return
        }
        putPageInConn(store, targetConn, newPage)
      },
      variables,
      ...rest
    })
  }
  return [execute, submitting] as const
}
