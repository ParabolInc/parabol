import {selectPinnedReports} from '../../../reports/pinnedReports'
import type {PinReportPayloadResolvers} from '../resolverTypes'

export type PinReportPayloadSource = {orgId: string; pinnedReportId: number}

const PinReportPayload: PinReportPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    dataLoader.get('organizations').loadNonNull(orgId),
  pinnedReport: async ({orgId, pinnedReportId}) => {
    const pins = await selectPinnedReports(orgId)
    return pins.find(({id}) => id === pinnedReportId)!
  }
}

export default PinReportPayload
