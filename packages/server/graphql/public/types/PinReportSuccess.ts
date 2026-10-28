import {selectPinnedReports} from '../../../reports/pinnedReports'
import type {PinReportSuccessResolvers} from '../resolverTypes'

export type PinReportSuccessSource = {orgId: string; pinnedReportId: number}

const PinReportSuccess: PinReportSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    dataLoader.get('organizations').loadNonNull(orgId),
  pinnedReport: async ({orgId, pinnedReportId}) => {
    const pins = await selectPinnedReports(orgId)
    return pins.find(({id}) => id === pinnedReportId)!
  }
}

export default PinReportSuccess
