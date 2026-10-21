import {selectReportPins} from '../../../reports/reportPins'
import type {PinReportSuccessResolvers} from '../resolverTypes'

export type PinReportSuccessSource = {orgId: string; pinRowId: number}

const PinReportSuccess: PinReportSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) =>
    dataLoader.get('organizations').loadNonNull(orgId),
  reportPin: async ({orgId, pinRowId}) => {
    const pins = await selectReportPins(orgId)
    return pins.find(({rowId}) => rowId === pinRowId)!
  }
}

export default PinReportSuccess
