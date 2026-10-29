import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAskReportQuestionMutation as TAskReportQuestionMutation} from '../__generated__/useAskReportQuestionMutation.graphql'
import handleRecentReportQuestion from './handlers/handleRecentReportQuestion'

const mutation = graphql`
  mutation useAskReportQuestionMutation($orgId: ID!, $question: String!, $timeZone: String!) {
    askReportQuestion(orgId: $orgId, question: $question, timeZone: $timeZone) {
      reportQuestion {
        id
        title
        spec
        ...ReportAskBox_recentQuestion
      }
      reason
    }
  }
`

const useAskReportQuestionMutation = () => {
  const [commit, submitting] = useMutation<TAskReportQuestionMutation>(mutation)
  const execute = (config: UseMutationConfig<TAskReportQuestionMutation>) => {
    const {orgId} = config.variables
    return commit({
      updater: (store) => {
        const reportQuestion = store
          .getRootField('askReportQuestion')
          ?.getLinkedRecord('reportQuestion')
        if (reportQuestion) handleRecentReportQuestion(store, orgId, reportQuestion)
      },
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAskReportQuestionMutation
