import {type ReportPinSource, toReportPinId} from '../../../reports/reportPins'
import runReport from '../../../reports/runReport'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import type {ReportPinResolvers} from '../resolverTypes'

export type {ReportPinSource}

const ReportPin: ReportPinResolvers = {
  id: toReportPinId,
  spec: ({spec}) => JSON.stringify(spec),
  pinnedBy: async ({createdBy}, _args, {dataLoader}) =>
    createdBy ? ((await dataLoader.get('users').load(createdBy)) ?? null) : null,
  report: ({orgId, spec}, {timeZone, pagePeriod}, {authToken, dataLoader}) =>
    runReport({
      orgId,
      spec,
      timeZone,
      pagePeriod: pagePeriod ?? null,
      viewerId: getUserId(authToken),
      isSuperUser: isSuperUser(authToken),
      dataLoader
    })
}

export default ReportPin
