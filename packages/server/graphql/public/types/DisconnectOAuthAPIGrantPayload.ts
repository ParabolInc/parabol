import type {DisconnectOAuthApiGrantPayloadResolvers} from '../resolverTypes'

export type DisconnectOAuthAPIGrantPayloadSource = {
  userId: string
}

const DisconnectOAuthAPIGrantPayload: DisconnectOAuthApiGrantPayloadResolvers = {
  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default DisconnectOAuthAPIGrantPayload
