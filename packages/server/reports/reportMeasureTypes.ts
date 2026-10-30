import type {
  ReportCategoryDimension,
  ReportMeasure
} from '../../client/shared/reports/reportCatalog'
import type RootDataLoader from '../dataloader/RootDataLoader'
import type {ReportLevelDimension} from './orgStructure'

export type ReportQueryDimension = ReportCategoryDimension | ReportLevelDimension

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
  // for an earlier period compared with, the steps of the period it's compared with. Team Health then reads each
  // team's check from a window reaching back at least 90 days, and only the teams and categories that period has
  comparedWith: {stepStarts: Date[]; readAt: Date[]} | null
  dimensions: ReportQueryDimension[]
  filters: ReportMeasureFilter[]
}

export interface ReportMeasureRow {
  // 1-based, matching the step it falls in
  stepIndex: number
  keys: string[]
  value: number | null
}

export type ReportDimensionLabels = Partial<Record<ReportQueryDimension, Record<string, string>>>

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
