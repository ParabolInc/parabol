import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import type {useUpdatePageMutation as TuseUpdatePageMutation} from '../__generated__/useUpdatePageMutation.graphql'
import type {useUpdatePageMutation_notification$data} from '../__generated__/useUpdatePageMutation_notification.graphql'

import type {PageConnectionKey} from '../components/DashNavList/LeftNavPageLink'
import getBaseRecord from '../utils/relay/getBaseRecord'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment useUpdatePageMutation_notification on UpdatePagePayload {
    page {
      id
      sortOrder
      teamId
      parentPageId
      isPrivate
      isParentLinked
      title
      ...LeftNavPageLink_page
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageMutation(
    $pageId: ID!
    $sortOrder: String!
    $teamId: ID
    $makePrivate: Boolean
  ) {
    updatePage(pageId: $pageId, sortOrder: $sortOrder, teamId: $teamId, makePrivate: $makePrivate) {
      ...useUpdatePageMutation_notification @relay(mask: false)
    }
  }
`

const getPageConn = (
  viewer: RecordProxy,
  parentPageId: string | null | undefined,
  teamId: string | null | undefined,
  isPrivate: boolean | undefined
) => {
  const connKey =
    parentPageId || teamId ? 'User_pages' : isPrivate ? 'User_privatePages' : 'User_sharedPages'

  return ConnectionHandler.getConnection(viewer, connKey, {
    parentPageId: parentPageId || null,
    teamId: teamId || undefined,
    isPrivate: isPrivatePageConnectionLookup[connKey]
  })!
}
export const handleUpdatePage = (
  page: RecordProxy<useUpdatePageMutation_notification$data['page']>,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const connParent = store.getRoot().getLinkedRecord('viewer')!
  const pageId = page.getValue('id')
  const oldRecord = getBaseRecord(store, pageId) as
    | {parentPageId: string | null; teamId: string | null; isPrivate: boolean}
    | undefined
  const {
    parentPageId: sourceParentPageId,
    teamId: sourceTeamId,
    isPrivate: sourceIsPrivate
  } = oldRecord || {}
  const sourceConn = getPageConn(connParent, sourceParentPageId, sourceTeamId, sourceIsPrivate)
  const targetTeamId = page.getValue('teamId')
  const targetParentPageId = page.getValue('parentPageId')
  const targetIsPrivate = page.getValue('isPrivate')
  const targetConn = getPageConn(connParent, targetParentPageId, targetTeamId, targetIsPrivate)
  safeRemoveNodeFromConn(pageId, sourceConn)
  safePutNodeInConn(targetConn, page, store, 'sortOrder', true)
}

export const isPrivatePageConnectionLookup = {
  User_privatePages: true,
  User_sharedPages: false
} as Record<PageConnectionKey, boolean>

export const useUpdatePageMutation = () => {
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
    return commit({
      updater: (store) => {
        const payload = store.getRootField('updatePage')
        if (!payload) return
        const page = payload.getLinkedRecord('page')
        handleUpdatePage(page, {store})
      },
      variables,
      ...rest
    })
  }
  return [execute, submitting] as const
}
