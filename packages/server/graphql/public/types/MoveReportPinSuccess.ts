import type {MoveReportPinSuccessResolvers} from '../resolverTypes'

export type MoveReportPinSuccessSource = {orgId: string}

const MoveReportPinSuccess: MoveReportPinSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default MoveReportPinSuccess
