import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useUpdatePageAccessMutation as TuseUpdatePageAccessMutation} from '../__generated__/useUpdatePageAccessMutation.graphql'

graphql`
  fragment useUpdatePageAccessMutation_payload on UpdatePageAccessPayload {
    page {
      isPrivate
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

export const useUpdatePageAccessMutation = () => {
  const [commit, submitting] = useMutation<TuseUpdatePageAccessMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageAccessMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
