import {selectPinnedReports} from '../../../reports/pinnedReports'
import type {PinReportSuccessResolvers} from '../resolverTypes'

export type PinReportSuccessSource = {orgId: string; pinRowId: number}

const PinReportSuccess: PinReportSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    dataLoader.get('organizations').loadNonNull(orgId),
  pinnedReport: async ({orgId, pinRowId}) => {
    const pins = await selectPinnedReports(orgId)
    return pins.find(({rowId}) => rowId === pinRowId)!
  }
}

export default PinReportSuccess
