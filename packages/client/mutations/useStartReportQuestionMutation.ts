import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useStartReportQuestionMutation as TStartReportQuestionMutation} from '../__generated__/useStartReportQuestionMutation.graphql'
import handleRecentReportQuestion from './handlers/handleRecentReportQuestion'

const mutation = graphql`
  mutation useStartReportQuestionMutation(
    $orgId: ID!
    $popularQuestionKey: String
    $reportQuestionId: ID
  ) {
    startReportQuestion(
      orgId: $orgId
      popularQuestionKey: $popularQuestionKey
      reportQuestionId: $reportQuestionId
    ) {
      reportQuestion {
        ...ReportAskBox_recentQuestion
      }
    }
  }
`

const useStartReportQuestionMutation = () => {
  const [commit, submitting] = useMutation<TStartReportQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TStartReportQuestionMutation>) => {
    const {orgId} = config.variables
    return commit({
      updater: (store) => {
        const reportQuestion = store
          .getRootField('startReportQuestion')
          ?.getLinkedRecord('reportQuestion')
        if (reportQuestion) handleRecentReportQuestion(store, orgId, reportQuestion)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useStartReportQuestionMutation
