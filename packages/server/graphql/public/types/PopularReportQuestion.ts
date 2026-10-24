import type {PopularReportQuestionRow} from '../../../reports/selectPopularReportQuestions'
import type {PopularReportQuestionResolvers} from '../resolverTypes'

export type PopularReportQuestionSource = PopularReportQuestionRow

const PopularReportQuestion: PopularReportQuestionResolvers = {
  id: ({key}) => `PopularReportQuestion:${key}`,
  spec: ({spec}) => JSON.stringify(spec)
}

export default PopularReportQuestion
