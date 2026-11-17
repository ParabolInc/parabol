import type {SetOrgStructurePayloadResolvers} from '../resolverTypes'

export type SetOrgStructurePayloadSource = {
  orgId: string
}

const SetOrgStructurePayload: SetOrgStructurePayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => dataLoader.get('organizations').loadNonNull(orgId)
}

export default SetOrgStructurePayload
