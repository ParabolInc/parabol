import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {NotifyRequestToJoinOrgResolvers} from '../resolverTypes'

const NotifyRequestToJoinOrg: NotifyRequestToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'REQUEST_TO_JOIN_ORG',
  domainJoinRequestId: ({domainJoinRequestId}) => {
    return DomainJoinRequestId.join(domainJoinRequestId)
  }
}

export default NotifyRequestToJoinOrg
