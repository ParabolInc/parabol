import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, type UseMutationConfig, useMutation} from 'react-relay'
import type {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import type {
  PageSectionEnum,
  useUpdatePageMutation as TuseUpdatePageMutation
} from '../__generated__/useUpdatePageMutation.graphql'
import type {useUpdatePageMutation_notification$data} from '../__generated__/useUpdatePageMutation_notification.graphql'

import type {PageConnectionKey} from '../components/DashNavList/LeftNavPageLink'
import getBaseRecord from '../utils/relay/getBaseRecord'
import safeRemoveNodeFromConn from '../utils/relay/safeRemoveNodeFromConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment useUpdatePageMutation_notification on UpdatePagePayload {
    pageSection
    page {
      id
      sortOrder
      userSortOrder
      teamId
      parentPageId
      isPrivate
      isParentLinked
      title
      ...LeftNavPageLink_page
      ...Page_page

    }
  }
`

const mutation = graphql`
  mutation useUpdatePageMutation(
    $pageId: ID!
    $sortOrder: String!
    $teamId: ID
    $sourceSection: PageSectionEnum!
    $targetSection: PageSectionEnum!
  ) {
    updatePage(pageId: $pageId, sortOrder: $sortOrder, teamId: $teamId, sourceSection: $sourceSection, targetSection: $targetSection) {
      ...useUpdatePageMutation_notification @relay(mask: false)
    }
  }
`

const getSourceConns = (
  viewer: RecordProxy,
  parentPageId: string | null | undefined,
  teamId: string | null | undefined,
  isPrivate: boolean | undefined
) => {
  // there's no deterministic way to know if a page lives under a team or under shared
  // since e.g. a team page could be shared with the viewer who is external to the team
  //       e.g. a child page is shared with the viewer, but the parent page is not

  if (isPrivate) {
    return [
      ConnectionHandler.getConnection(viewer, 'User_privatePages', {
        parentPageId: null,
        teamId: undefined,
        isPrivate: isPrivatePageConnectionLookup['User_privatePages']
      })!
    ]
  }

  const sharedPageConn = ConnectionHandler.getConnection(viewer, 'User_sharedPages', {
    parentPageId: null,
    teamId: undefined,
    isPrivate: isPrivatePageConnectionLookup['User_sharedPages']
  })!

  const subPageConn = ConnectionHandler.getConnection(viewer, 'User_pages', {
    parentPageId: parentPageId || null,
    teamId: teamId || undefined,
    isPrivate: isPrivatePageConnectionLookup['User_pages']
  })!
  return [sharedPageConn, subPageConn]
}

const getTargetConn = (
  viewer: RecordProxy,
  section: PageSectionEnum,
  parentPageId: string | null | undefined,
  teamId: string | null | undefined
) => {
  if (section === 'private') {
    return ConnectionHandler.getConnection(viewer, 'User_privatePages', {
      parentPageId: null,
      teamId: undefined,
      isPrivate: isPrivatePageConnectionLookup['User_privatePages']
    })!
  }
  if (section === 'shared') {
    return ConnectionHandler.getConnection(viewer, 'User_sharedPages', {
      parentPageId: null,
      teamId: undefined,
      isPrivate: isPrivatePageConnectionLookup['User_sharedPages']
    })!
  }
  return ConnectionHandler.getConnection(viewer, 'User_pages', {
    parentPageId: parentPageId || null,
    teamId: teamId || undefined,
    isPrivate: isPrivatePageConnectionLookup['User_pages']
  })!
}
export const handleUpdatePage = (
  payload: RecordProxy<Omit<useUpdatePageMutation_notification$data, ' $fragmentType'>>,
  {store}: {store: RecordSourceSelectorProxy}
) => {
  const page = payload.getLinkedRecord('page')
  const section = payload.getValue('pageSection')
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
  const sourceConns = getSourceConns(connParent, sourceParentPageId, sourceTeamId, sourceIsPrivate)
  const targetTeamId = page.getValue('teamId')
  const targetParentPageId = page.getValue('parentPageId')
  const targetConn = getTargetConn(connParent, section, targetParentPageId, targetTeamId)
  sourceConns.forEach((conn) => {
    safeRemoveNodeFromConn(pageId, conn)
  })
  const sortOrder = section === 'shared' ? 'userSortOrder' : 'sortOrder'
  safePutNodeInConn(targetConn, page, store, sortOrder, true)
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
        handleUpdatePage(payload, {store})
      },
      variables,
      ...rest
    })
  }
  return [execute, submitting] as const
}
