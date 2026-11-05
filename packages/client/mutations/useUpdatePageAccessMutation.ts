import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpdatePageAccessMutation as TuseUpdatePageAccessMutation} from '../__generated__/useUpdatePageAccessMutation.graphql'
import {handleUpdatePage} from './useUpdatePageMutation'

graphql`
  fragment useUpdatePageAccessMutation_notification on UpdatePageAccessPayload {
    pageSection
    page {
      id
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
      ...Page_page
      ...PageEntry_page
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

export const useUpdatePageAccessMutation = () => {
  const [commit, submitting] = useMutation<TuseUpdatePageAccessMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageAccessMutation>) => {
    return commit({
      updater: (store) => {
        const payload = store.getRootField('updatePageAccess')
        if (!payload) return
        handleUpdatePage(payload, {store})
      },
      ...config
    })
  }
  return [execute, submitting] as const
}
