import type {AcceptRequestToJoinDomainPayloadResolvers} from '../resolverTypes'

export type AcceptRequestToJoinDomainPayloadSource = {
  viewerId: string
}

const AcceptRequestToJoinDomainPayload: AcceptRequestToJoinDomainPayloadResolvers = {
  viewer: async ({viewerId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AcceptRequestToJoinDomainPayload
