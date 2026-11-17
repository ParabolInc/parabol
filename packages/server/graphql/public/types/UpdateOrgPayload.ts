import type {UpdateOrgPayloadResolvers} from '../resolverTypes'

export type UpdateOrgPayloadSource = {
  orgId: string
}

const UpdateOrgPayload: UpdateOrgPayloadResolvers = {
  organization: async (source, _args, {dataLoader}) => {
    const {orgId} = source
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default UpdateOrgPayload
