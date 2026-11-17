import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useLogReportQuestionUseMutation as TLogReportQuestionUseMutation} from '../__generated__/useLogReportQuestionUseMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import handleRecentReportQuestion from './handlers/handleRecentReportQuestion'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useLogReportQuestionUseMutation(
    $orgId: ID!
    $popularQuestionKey: String
    $reportQuestionId: ID
    $spec: ReportSpecInput
    $title: String
  ) {
    logReportQuestionUse(
      orgId: $orgId
      popularQuestionKey: $popularQuestionKey
      reportQuestionId: $reportQuestionId
      spec: $spec
      title: $title
    ) {
      reportQuestion {
        id
        ...ReportAskBox_recentQuestion
      }
    }
  }
`

const useLogReportQuestionUseMutation = () => {
  const [commit, submitting] = useMutation<TLogReportQuestionUseMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TLogReportQuestionUseMutation>) => {
    const {orgId} = config.variables
    return commit({
      updater: (store) => {
        const reportQuestion = store
          .getRootField('logReportQuestionUse')
          ?.getLinkedRecord('reportQuestion')
        if (reportQuestion) handleRecentReportQuestion(store, orgId, reportQuestion)
      },
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useLogReportQuestionUseMutation
