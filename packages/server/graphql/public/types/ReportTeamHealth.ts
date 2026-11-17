import {
  readLatestTeamHealthCheckEndedAt,
  readReportTeamHealthChecks
} from '../../../reports/reportTeamHealth'
import type {ReportResultSource} from '../../../reports/runReport'
import type {ReportTeamHealthResolvers} from '../resolverTypes'

export type ReportTeamHealthSource = Pick<ReportResultSource, 'from' | 'to' | 'reportableTeamIds'>

const ReportTeamHealth: ReportTeamHealthResolvers = {
  checks: (source, _args, {dataLoader}) => readReportTeamHealthChecks(source, dataLoader),
  latestCheckEndedAt: ({reportableTeamIds}, _args, {dataLoader}) =>
    readLatestTeamHealthCheckEndedAt(reportableTeamIds, dataLoader)
}

export default ReportTeamHealth
