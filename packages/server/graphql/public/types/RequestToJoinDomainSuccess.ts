import {RequestToJoinDomainSuccessResolvers} from '../resolverTypes'

export type RequestToJoinDomainSuccessSource = {
  success: boolean
}

const RequestToJoinDomainSuccess: RequestToJoinDomainSuccessResolvers = {
  success: async ({success}) => {
    return success
  }
}

export default RequestToJoinDomainSuccess
