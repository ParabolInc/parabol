import type {ReportQuestionSource} from './ReportQuestion'

export interface AskReportQuestionPayloadSource {
  reportQuestion: ReportQuestionSource
  reason: string | null
  suggestion: string | null
}
