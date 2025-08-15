import graphql from 'babel-plugin-relay/macro'
import {ConnectionHandler, type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePageAccessMutation as TuseUpdatePageAccessMutation} from '../__generated__/useUpdatePageAccessMutation.graphql'
import findNodeInConn from '../utils/relay/findNodeInConn'
import safePutNodeInConn from './handlers/safePutNodeInConn'

graphql`
  fragment useUpdatePageAccessMutation_payload on UpdatePageAccessPayload {
    page {
      isPrivate
      isParentLinked
      parentPageId
      teamId
      sortOrder
      ...PageSharingAccessList_pageAccess @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageAccessMutation(
    $pageId: ID!
    $subjectType: PageSubjectEnum!
    $subjectId: ID!
    $role: PageRoleEnum
    $unlinkApproved: Boolean
  ) {
    updatePageAccess(
      pageId: $pageId
      subjectType: $subjectType
      subjectId: $subjectId
      role: $role
      unlinkApproved: $unlinkApproved
    ) {
      ...useUpdatePageAccessMutation_payload @relay(mask: false)
    }
  }
`

// since all preview types (e.g. TeamPreview) start with the `preview:` in their ID
// this is because relay forces a GUID, so it can't have the same ID as a Team type
// We need to use a TeamPreview type here
// so someone with viewer access doesn't access all the props on the Team object
const getServerSubjectId = (subjectId: string) => {
  const PREFIX = 'preview:'
  return subjectId.startsWith(PREFIX) ? subjectId.slice(PREFIX.length) : subjectId
}
export const useUpdatePageAccessMutation = () => {
  const [commit, submitting] = useMutation<TuseUpdatePageAccessMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageAccessMutation>) => {
    return commit({
      updater(store) {
        const page = store.getRootField('updatePageAccess')?.getLinkedRecord('page')
        if (!page) return
        const isPrivate = page.getValue('isPrivate')
        const teamId = page.getValue('teamId')
        const parentPageId = page.getValue('parentPageId')
        const pageId = page.getDataID()
        if (teamId || parentPageId) return
        // If it's a top-level page, make sure it didn't move from Shared <-> Private
        const viewer = store.getRoot().getLinkedRecord('viewer')!
        const sharedConn = ConnectionHandler.getConnection(viewer, 'User_sharedPages', {
          isPrivate: false,
          parentPageId: null
        })!
        const privateConn = ConnectionHandler.getConnection(viewer, 'User_privatePages', {
          isPrivate: true
        })!
        const targetConn = isPrivate ? privateConn : sharedConn
        const inTarget = findNodeInConn(targetConn, pageId)
        if (inTarget) return
        const sourceConn = isPrivate ? sharedConn : privateConn
        ConnectionHandler.deleteNode(sourceConn, pageId)
        safePutNodeInConn(targetConn, page, store, 'sortOrder', true)
      },
      ...config,
      variables: {
        ...config.variables,
        subjectId: getServerSubjectId(config.variables.subjectId)
      }
    })
  }
  return [execute, submitting] as const
}
