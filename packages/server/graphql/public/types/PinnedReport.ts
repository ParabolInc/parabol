import {parseReportPeriod} from '../../../../client/shared/reports/parseReportSpec'
import {type PinnedReportSource, toPinnedReportKey} from '../../../reports/pinnedReports'
import runReport from '../../../reports/runReport'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import type {PinnedReportResolvers} from '../resolverTypes'

export type {PinnedReportSource}

const PinnedReport: PinnedReportResolvers = {
  id: toPinnedReportKey,
  spec: ({spec}) => JSON.stringify(spec),
  pinnedBy: async ({createdBy}, _args, {dataLoader}) =>
    createdBy ? ((await dataLoader.get('users').load(createdBy)) ?? null) : null,
  report: ({orgId, spec}, {timeZone, pagePeriod}, {authToken, dataLoader}) =>
    runReport({
      orgId,
      spec,
      timeZone,
      pagePeriod: pagePeriod ? parseReportPeriod(pagePeriod) : null,
      viewerId: getUserId(authToken),
      isSuperUser: isSuperUser(authToken),
      dataLoader
    })
}

export default PinnedReport
