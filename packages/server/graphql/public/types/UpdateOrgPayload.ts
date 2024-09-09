import {UpdateOrgPayloadResolvers} from '../resolverTypes'

export type UpdateOrgPayloadSource =
  | {
      orgId: string
    }
  | {error: {message: string}}

const UpdateOrgPayload: UpdateOrgPayloadResolvers = {
  organization: async (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    const {orgId} = source
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default UpdateOrgPayload
