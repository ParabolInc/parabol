import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useRateReportQuestionMutation as TRateReportQuestionMutation} from '../__generated__/useRateReportQuestionMutation.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {snackOnError} from './handlers/snackOnError'

const mutation = graphql`
  mutation useRateReportQuestionMutation(
    $orgId: ID!
    $reportQuestionId: ID!
    $rating: ReportQuestionRatingEnum
  ) {
    rateReportQuestion(orgId: $orgId, reportQuestionId: $reportQuestionId, rating: $rating) {
      reportQuestion {
        id
        rating
      }
    }
  }
`

const useRateReportQuestionMutation = () => {
  const [commit, submitting] = useMutation<TRateReportQuestionMutation>(mutation)
  const atmosphere = useAtmosphere()
  const execute = (config: UseMutationConfig<TRateReportQuestionMutation>) => {
    const {reportQuestionId, rating} = config.variables
    return commit({
      optimisticResponse: {
        rateReportQuestion: {reportQuestion: {id: reportQuestionId, rating: rating ?? null}}
      },
      onError: snackOnError(atmosphere),
      ...config
    })
  }
  return [execute, submitting] as const
}

export default useRateReportQuestionMutation
