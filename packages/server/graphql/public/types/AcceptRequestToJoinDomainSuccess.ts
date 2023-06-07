import {AcceptRequestToJoinDomainSuccessResolvers} from '../resolverTypes'

export type AcceptRequestToJoinDomainSuccessSource = {
  viewerId: string
}

const AcceptRequestToJoinDomainSuccess: AcceptRequestToJoinDomainSuccessResolvers = {
  viewer: async ({viewerId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(viewerId)
  }
}

export default AcceptRequestToJoinDomainSuccess
