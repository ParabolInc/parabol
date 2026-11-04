import type {ReportQuestionSource} from './ReportQuestion'

export interface AskReportQuestionSuccessSource {
  reportQuestion: ReportQuestionSource
  reason: string | null
  suggestion: string | null
}
