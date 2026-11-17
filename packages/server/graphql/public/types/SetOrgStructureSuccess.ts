import type {SetOrgStructureSuccessResolvers} from '../resolverTypes'

export type SetOrgStructureSuccessSource = {
  orgId: string
}

const SetOrgStructureSuccess: SetOrgStructureSuccessResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default SetOrgStructureSuccess
