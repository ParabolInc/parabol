import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useMovePinnedReportMutation as TMovePinnedReportMutation} from '../__generated__/useMovePinnedReportMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useMovePinnedReportMutation($orgId: ID!, $pinId: ID!, $toIndex: Int!) {
    movePinnedReport(orgId: $orgId, pinId: $pinId, toIndex: $toIndex) {
      organization {
        id
        pinnedReports {
          id
        }
      }
    }
  }
`

const useMovePinnedReportMutation = () => {
  const [commit, submitting] = useMutation<TMovePinnedReportMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TMovePinnedReportMutation>) =>
    commit({onError: snackOnError(atmosphere), ...config})
  return [execute, submitting] as const
}

export default useMovePinnedReportMutation
