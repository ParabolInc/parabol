import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {usePinReportMutation as TPinReportMutation} from '../__generated__/usePinReportMutation.graphql'

const mutation = graphql`
  mutation usePinReportMutation(
    $orgId: ID!
    $spec: ReportSpecInput!
    $title: String!
    $reportQuestionId: ID
    $timeZone: String!
    $pagePeriod: ReportPeriodInput!
  ) {
    pinReport(orgId: $orgId, spec: $spec, title: $title, reportQuestionId: $reportQuestionId) {
      reportPin {
        id
        ...ReportCard_pin
      }
      organization {
        id
        reportPins {
          id
          title
          spec
          pinnedBy {
            id
            preferredName
          }
        }
      }
    }
  }
`

const usePinReportMutation = () => {
  const [commit, submitting] = useMutation<TPinReportMutation>(mutation)
  const execute = (config: UseMutationConfig<TPinReportMutation>) => commit(config)
  return [execute, submitting] as const
}

export default usePinReportMutation
