import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useMarkReportsViewedMutation as TMarkReportsViewedMutation} from '../__generated__/useMarkReportsViewedMutation.graphql'

const mutation = graphql`
  mutation useMarkReportsViewedMutation($orgId: ID!) {
    markReportsViewed(orgId: $orgId) {
      user {
        id
        reportsOrganization {
          id
        }
      }
    }
  }
`

const useMarkReportsViewedMutation = () => {
  const [commit, submitting] = useMutation<TMarkReportsViewedMutation>(mutation)
  const execute = (config: UseMutationConfig<TMarkReportsViewedMutation>) => commit(config)
  return [execute, submitting] as const
}

export default useMarkReportsViewedMutation
