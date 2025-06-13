import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import type {RecordSourceSelectorProxy} from 'relay-runtime'
import {useArchivePageMutation as TArchivePageMutation} from '../__generated__/useArchivePageMutation.graphql'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'
import {isPrivatePageConnectionLookup} from './useUpdatePageMutation'

graphql`
  fragment useArchivePageMutation_notification on ArchivePagePayload {
    page {
      ...LeftNavPageLink_page @relay(mask: false)
      id
      deletedAt
      deletedBy
      sortOrder
      # When restoring a child without its parent, it will get promoted to top-level
      parentPageId
      teamId
    }
  }
`

const mutation = graphql`
  mutation useArchivePageMutation($pageId: ID!, $action: ArchivePageActionEnum!) {
    archivePage(pageId: $pageId, action: $action) {
      ...useArchivePageMutation_notification @relay(mask: false)
    }
  }
`

export const handleArchivePage = (
  pageId: string,
  context: {store: RecordSourceSelectorProxy; isHardDelete: boolean}
) => {
  const {store, isHardDelete} = context
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const page = store.get(pageId)
  if (!page || !viewer) return
  const parentPageId = page.getValue('parentPageId')
  const teamId = page.getValue('teamId')
  const isPrivate = page.getValue('isPrivate')
  const isRestore = !page.getValue('deletedAt')
  const connectionKey =
    parentPageId || teamId ? 'User_pages' : isPrivate ? 'User_privatePages' : 'User_sharedPages'
  const conn = ConnectionHandler.getConnection(viewer, connectionKey, {
    parentPageId: parentPageId || undefined,
    teamId: teamId || undefined,
    isPrivate: isPrivatePageConnectionLookup[connectionKey]
  })!
  const archivedConn = ConnectionHandler.getConnection(viewer, 'User_archivedPages', {
    isArchived: true
  })

  if (isRestore) {
    safeRemoveNodeFromConn(pageId, archivedConn)
    safePutNodeInConn(conn, page, store, 'sortOrder', true)
  } else {
    safeRemoveNodeFromConn(pageId, conn)
    if (!isHardDelete && page.getValue('deletedBy') === viewer.getDataID()) {
      safePutNodeInConn(archivedConn, page, store, 'deletedAt', false)
    }
  }
}
export const useArchivePageMutation = () => {
  const [commit, submitting] = useMutation<TArchivePageMutation>(mutation)
  const execute = (config: UseMutationConfig<TArchivePageMutation>) => {
    const {variables} = config
    const {pageId, action} = variables
    return commit({
      updater: (store) => {
        handleArchivePage(pageId, {store, isHardDelete: action === 'delete'})
      },
      ...config
    })
  }
  return [execute, submitting] as const
}
