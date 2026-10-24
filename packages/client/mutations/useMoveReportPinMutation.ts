import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useMoveReportPinMutation as TMoveReportPinMutation} from '../__generated__/useMoveReportPinMutation.graphql'

const mutation = graphql`
  mutation useMoveReportPinMutation($orgId: ID!, $pinId: ID!, $toIndex: Int!) {
    moveReportPin(orgId: $orgId, pinId: $pinId, toIndex: $toIndex) {
      organization {
        id
        reportPins {
          id
        }
      }
    }
  }
`

const useMoveReportPinMutation = () => {
  const [commit, submitting] = useMutation<TMoveReportPinMutation>(mutation)
  const execute = (config: UseMutationConfig<TMoveReportPinMutation>) => commit(config)
  return [execute, submitting] as const
}

export default useMoveReportPinMutation
