import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePageAccessMutation as TuseUpdatePageAccessMutation} from '../__generated__/useUpdatePageAccessMutation.graphql'
import {handleUpdatePage} from './useUpdatePageMutation'

graphql`
  fragment useUpdatePageAccessMutation_notification on UpdatePageAccessPayload {
    pageSection
    page {
      isPrivate
      isParentLinked
      parentPageId
      teamId
      sortOrder
      userSortOrder
      title
      access {
        viewer
        public
      }
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
      ...useUpdatePageAccessMutation_notification @relay(mask: false)
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
      updater: (store) => {
        const payload = store.getRootField('updatePageAccess')
        if (!payload) return
        handleUpdatePage(payload, {store})
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
