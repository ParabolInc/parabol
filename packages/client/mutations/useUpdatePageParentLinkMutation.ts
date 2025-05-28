import graphql from 'babel-plugin-relay/macro'
import {useMutation, UseMutationConfig} from 'react-relay'
import {useUpdatePageParentLinkMutation as TuseUpdatePageParentLinkMutation} from '../__generated__/useUpdatePageParentLinkMutation.graphql'

graphql`
  fragment useUpdatePageParentLinkMutation_payload on UpdatePagePayload {
    page {
      isPrivate
      isParentLinked
      ...PageSharingAccessList_pageAccess @relay(mask: false)
    }
  }
`

const mutation = graphql`
  mutation useUpdatePageParentLinkMutation($pageId: ID!, $isParentLinked: Boolean!) {
    updatePageParentLink(pageId: $pageId, isParentLinked: $isParentLinked) {
      ...useUpdatePageParentLinkMutation_payload @relay(mask: false)
    }
  }
`
export const useUpdatePageParentLinkMutation = () => {
  const [commit, submitting] = useMutation<TuseUpdatePageParentLinkMutation>(mutation)
  const execute = (config: UseMutationConfig<TuseUpdatePageParentLinkMutation>) => {
    return commit(config)
  }
  return [execute, submitting] as const
}
