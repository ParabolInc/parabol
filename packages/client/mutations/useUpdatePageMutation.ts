import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import {useUpdatePageMutation as TuseUpdatePageMutation} from '../__generated__/useUpdatePageMutation.graphql'
import type {PageConnectionKey} from '../components/DashNavList/LeftNavPageLink'
import useAtmosphere from '../hooks/useAtmosphere'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment useUpdatePageMutation_payload on UpdatePagePayload {
    page {
      sortOrder
      teamId
      parentPageId
      isPrivate
      isParentLinked
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
        const connParent = store.get(viewerId)!
        const isSourcePrivate = isPrivatePageConnectionLookup[sourceConnectionKey]
        const isTargetPrivate = isPrivatePageConnectionLookup[targetConnectionKey]
        const sourceConn = ConnectionHandler.getConnection(connParent, sourceConnectionKey, {
          parentPageId: sourceParentPageId || undefined,
          teamId: sourceTeamId || undefined,
          isPrivate: isSourcePrivate
        })!
        ConnectionHandler.deleteNode(sourceConn, pageId)

        const targetConn = ConnectionHandler.getConnection(connParent, targetConnectionKey, {
          parentPageId: targetParentPageId || undefined,
          teamId: targetTeamId || undefined,
          isPrivate: isTargetPrivate
        })
        if (!targetConn) {
          // is the target is not expanded, no connection exists yet
          return
        }
        safePutNodeInConn(targetConn, newPage, store, 'sortOrder', true)
      },
      variables,
      ...rest
    })
  }
  return [execute, submitting] as const
}
