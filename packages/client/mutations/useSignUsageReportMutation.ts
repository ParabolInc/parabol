import graphql from 'babel-plugin-relay/macro'
import {useMutation} from 'react-relay'
import type {useSignUsageReportMutation as TSignUsageReportMutation} from '../__generated__/useSignUsageReportMutation.graphql'

const mutation = graphql`
  mutation useSignUsageReportMutation($orgId: ID!) {
    signUsageReport(orgId: $orgId) {
      file
      fileName
    }
  }
`

const useSignUsageReportMutation = () => useMutation<TSignUsageReportMutation>(mutation)

export default useSignUsageReportMutation
