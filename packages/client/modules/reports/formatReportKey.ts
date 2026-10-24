import {isReportTimeDimension, type ReportDimension} from '../../shared/reports/reportCatalog'
import {formatReportStep} from './formatReportValue'
import type {ReportResultKey} from './reportRows'
import type {ReportStepLength} from './reportSpecLabels'

export const PARTIAL_STEP_NOTE = 'Cut short by the period'

export const formatReportKey = (
  key: ReportResultKey,
  dimension: ReportDimension,
  step: ReportStepLength | null | undefined,
  isLong = false
) => (isReportTimeDimension(dimension) ? formatReportStep(key.label, step, isLong) : key.label)
