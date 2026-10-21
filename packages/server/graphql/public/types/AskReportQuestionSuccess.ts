import type {PopularReportQuestionSource} from './PopularReportQuestion'
import type {ReportQuestionSource} from './ReportQuestion'

export interface AskReportQuestionSuccessSource {
  reportQuestion: ReportQuestionSource
  reason: string | null
  suggestions: PopularReportQuestionSource[]
}
