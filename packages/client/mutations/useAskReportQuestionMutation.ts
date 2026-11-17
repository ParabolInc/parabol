import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useAskReportQuestionMutation as TAskReportQuestionMutation} from '../__generated__/useAskReportQuestionMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import handleRecentReportQuestion from './handlers/handleRecentReportQuestion'
import {snackOnError} from './handlers/snackOnError'

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
      suggestion
    }
  }
`

const useAskReportQuestionMutation = () => {
  const [commit, submitting] = useMutation<TAskReportQuestionMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TAskReportQuestionMutation>) => {
    const {orgId} = config.variables
    return commit({
      updater: (store) => {
        const reportQuestion = store
          .getRootField('askReportQuestion')
          ?.getLinkedRecord('reportQuestion')
        if (reportQuestion) handleRecentReportQuestion(store, orgId, reportQuestion)
      },
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useAskReportQuestionMutation
