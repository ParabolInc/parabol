import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRequestPageAccessMutation as TuseRequestPageAccessMutation} from '../__generated__/useRequestPageAccessMutation.graphql'

graphql`
  fragment useRequestPageAccessMutation_notification on UpdatePageAccessPayload {
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
  mutation useRequestPageAccessMutation(
    $pageId: ID!
    $reason: String!
    $role: PageRoleEnum!
  ) {
    requestPageAccess(
      pageId: $pageId
      reason: $reason
      role: $role
    )
  }
`

export const useRequestPageAccessMutation = () => {
  const [commit, submitting] = useMutation<TuseRequestPageAccessMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseRequestPageAccessMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
