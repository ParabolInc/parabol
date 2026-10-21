import type {ReportSpec} from '../../../../client/shared/reports/reportCatalog'
import runReport from '../../../reports/runReport'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import type {ReportPinResolvers} from '../resolverTypes'

export interface ReportPinSource {
  orgId: string
  key: string
  title: string
  description: string
  spec: ReportSpec
}

const ReportPin: ReportPinResolvers = {
  // a pin's numbers depend on its org, so the same built-in report gets an id per org
  id: ({orgId, key}) => `ReportPin:${orgId}:${key}`,
  spec: ({spec}) => JSON.stringify(spec),
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
