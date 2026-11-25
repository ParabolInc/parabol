import type {RevokeOAuthApiGrantPayloadResolvers} from '../resolverTypes'

export interface RevokeOAuthAPIGrantPayloadSource {
  userId: string
}

const RevokeOAuthAPIGrantPayload: RevokeOAuthApiGrantPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default RevokeOAuthAPIGrantPayload
