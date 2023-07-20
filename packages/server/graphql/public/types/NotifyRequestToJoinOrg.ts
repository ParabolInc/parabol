import {NotifyRequestToJoinOrgResolvers} from '../resolverTypes'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'

const NotifyRequestToJoinOrg: NotifyRequestToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'REQUEST_TO_JOIN_ORG',
  domainJoinRequestId: ({domainJoinRequestId}) => {
    return DomainJoinRequestId.join(domainJoinRequestId)
  }
}

export default NotifyRequestToJoinOrg
