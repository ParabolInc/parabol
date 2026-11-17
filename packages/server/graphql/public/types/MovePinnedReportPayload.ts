import type {MovePinnedReportPayloadResolvers} from '../resolverTypes'

export type MovePinnedReportPayloadSource = {orgId: string}

const MovePinnedReportPayload: MovePinnedReportPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default MovePinnedReportPayload
