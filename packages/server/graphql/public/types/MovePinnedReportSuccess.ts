import type {MovePinnedReportSuccessResolvers} from '../resolverTypes'

export type MovePinnedReportSuccessSource = {orgId: string}

const MovePinnedReportSuccess: MovePinnedReportSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default MovePinnedReportSuccess
