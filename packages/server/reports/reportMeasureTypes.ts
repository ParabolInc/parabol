import type {
  ReportCategoryDimension,
  ReportMeasure
} from '../../client/shared/reports/reportCatalog'
import type RootDataLoader from '../dataloader/RootDataLoader'

export interface ReportMeasureFilter {
  dimension: ReportCategoryDimension
  values: string[]
}

export interface ReportMeasureQuery {
  measure: ReportMeasure
  orgId: string
  teamIds: string[]
  // the teams the viewer is on, whose own templates they can see named
  ownTeamIds: string[]
  // count everyone in the organization instead of the people on its teams
  isWholeOrg: boolean
  stepStarts: Date[]
  stepEnds: Date[]
  // readings are taken at the end of each step, or now for the step that hasn't ended
  readAt: Date[]
  // each step reads Team Health from the 90 days before it, instead of from the whole period
  hasTimeSteps: boolean
  // which of each team's Team Health checks to read: its latest in the window, or the one before that
  check: 'latest' | 'previous'
  dimensions: ReportCategoryDimension[]
  filters: ReportMeasureFilter[]
}

export interface ReportMeasureRow {
  // 1-based, matching the step it falls in
  stepIndex: number
  keys: string[]
  value: number | null
}

export type ReportDimensionLabels = Partial<Record<ReportCategoryDimension, Record<string, string>>>

export interface ReportMeasureResult {
  rows: ReportMeasureRow[]
  // how many tasks were counted with an estimated done date
  estimatedCount: number
  labels: ReportDimensionLabels
  // teams whose check was hidden because too few people answered it
  hiddenTeamIds: string[]
}

export type ReportMeasureFunction = (
  query: ReportMeasureQuery,
  dataLoader: RootDataLoader
) => Promise<ReportMeasureResult>
