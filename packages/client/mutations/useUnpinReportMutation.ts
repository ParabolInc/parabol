import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUnpinReportMutation as TUnpinReportMutation} from '../__generated__/useUnpinReportMutation.graphql'

const mutation = graphql`
  mutation useUnpinReportMutation($orgId: ID!, $pinId: ID!) {
    unpinReport(orgId: $orgId, pinId: $pinId) {
      organization {
        id
        reportPins {
          id
        }
      }
    }
  }
`

const useUnpinReportMutation = () => {
  const [commit, submitting] = useMutation<TUnpinReportMutation>(mutation)
  const execute = (config: UseMutationConfig<TUnpinReportMutation>) => commit(config)
  return [execute, submitting] as const
}

export default useUnpinReportMutation
