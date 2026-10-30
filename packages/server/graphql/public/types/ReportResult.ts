import {isTeamHealthHeatmapSpec} from '../../../../client/shared/reports/teamHealthReportSpec'
import type {ReportResultSource} from '../../../reports/runReport'
import type {ReportResultResolvers} from '../resolverTypes'

export type {ReportResultSource}

const ReportResult: ReportResultResolvers = {
  teamHealth: (source) => (isTeamHealthHeatmapSpec(source.spec) ? source : null),
  latestMeetingAt: ({reportableTeamIds}, {meetingType}, {dataLoader}) =>
    dataLoader.get('latestMeetingAtByTeamIds').load({teamIds: reportableTeamIds, meetingType}),
  latestTaskAt: ({reportableTeamIds}, _args, {dataLoader}) =>
    dataLoader.get('latestTaskAtByTeamIds').load(reportableTeamIds)
}

export default ReportResult
