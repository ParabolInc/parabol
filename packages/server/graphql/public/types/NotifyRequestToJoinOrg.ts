import {NotifyRequestToJoinOrgResolvers} from '../resolverTypes'

const NotifyRequestToJoinOrg: NotifyRequestToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'REQUEST_TO_JOIN_ORG'
}

export default NotifyRequestToJoinOrg
