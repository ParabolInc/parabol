import {readReportTeamHealth} from '../../../reports/reportTeamHealth'
import type {ReportResultSource} from '../../../reports/runReport'
import type {ReportResultResolvers} from '../resolverTypes'

export type {ReportResultSource}

const ReportResult: ReportResultResolvers = {
  teamHealth: (source, _args, {dataLoader}) => readReportTeamHealth(source, dataLoader)
}

export default ReportResult
