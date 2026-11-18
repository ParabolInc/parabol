import type {UnpinReportPayloadResolvers} from '../resolverTypes'

export type UnpinReportPayloadSource = {orgId: string}

const UnpinReportPayload: UnpinReportPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default UnpinReportPayload
