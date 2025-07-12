import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, useMutation, UseMutationConfig} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {useUpdatePageMutation as TuseUpdatePageMutation} from '../__generated__/useUpdatePageMutation.graphql'
import {useUpdatePageMutation_notification$data} from '../__generated__/useUpdatePageMutation_notification.graphql'

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

export const handleUpdatePage = (
  page: RecordProxy<useUpdatePageMutation_notification$data['page']>,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const connParent = store.getRoot().getLinkedRecord('viewer')!
  const pageId = page.getValue('id')
  const oldRecord = getBaseRecord(store, pageId)
  if (oldRecord) {
    // if this record exists on the client, remove it
    const {
      parentPageId: sourceParentPageId,
      teamId: sourceTeamId,
      isPrivate: sourceIsPrivate
    } = oldRecord
    const sourceConnectionKey =
      sourceParentPageId || sourceTeamId
        ? 'User_pages'
        : sourceIsPrivate
          ? 'User_privatePages'
          : 'User_sharedPages'
    const isSourcePrivate = isPrivatePageConnectionLookup[sourceConnectionKey]
    const sourceConn = ConnectionHandler.getConnection(connParent, sourceConnectionKey, {
      parentPageId: sourceParentPageId || null,
      teamId: sourceTeamId || undefined,
      isPrivate: isSourcePrivate
    })!
    safeRemoveNodeFromConn(pageId, sourceConn)
  }
  const targetTeamId = page.getValue('teamId')
  const targetParentPageId = page.getValue('parentPageId')
  const targetIsPrivate = page.getValue('isPrivate')
  const targetConnectionKey =
    targetParentPageId || targetTeamId
      ? 'User_pages'
      : targetIsPrivate
        ? 'User_privatePages'
        : 'User_sharedPages'
  const isTargetPrivate = isPrivatePageConnectionLookup[targetConnectionKey]

  const targetConn = ConnectionHandler.getConnection(connParent, targetConnectionKey, {
    parentPageId: targetParentPageId || null,
    teamId: targetTeamId || undefined,
    isPrivate: isTargetPrivate
  })
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
