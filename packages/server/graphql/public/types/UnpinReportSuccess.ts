import type {UnpinReportSuccessResolvers} from '../resolverTypes'

export type UnpinReportSuccessSource = {orgId: string}

const UnpinReportSuccess: UnpinReportSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default UnpinReportSuccess
