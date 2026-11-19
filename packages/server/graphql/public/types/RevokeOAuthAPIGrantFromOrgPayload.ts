import type {RevokeOAuthApiGrantFromOrgPayloadResolvers} from '../resolverTypes'

export type RevokeOAuthAPIGrantFromOrgPayloadSource = {
  orgId: string
}

const RevokeOAuthAPIGrantFromOrgPayload: RevokeOAuthApiGrantFromOrgPayloadResolvers = {
  organization: ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default RevokeOAuthAPIGrantFromOrgPayload
