import {NotifyRequestToJoinOrgResolvers} from '../resolverTypes'
import toGlobalId from '../../../utils/toGlobalId'

const NotifyRequestToJoinOrg: NotifyRequestToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'REQUEST_TO_JOIN_ORG',
  domainJoinRequestId: ({domainJoinRequestId}) => {
    return toGlobalId('DomainJoinRequest', domainJoinRequestId)
  }
}

export default NotifyRequestToJoinOrg
