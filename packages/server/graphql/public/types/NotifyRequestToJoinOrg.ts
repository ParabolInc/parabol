import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {NotifyRequestToJoinOrgResolvers} from '../resolverTypes'

const NotifyRequestToJoinOrg: NotifyRequestToJoinOrgResolvers = {
  __isTypeOf: ({type}) => type === 'REQUEST_TO_JOIN_ORG',
  domainJoinRequestId: ({domainJoinRequestId}) => {
    return DomainJoinRequestId.join(domainJoinRequestId)
  },
  picture: async ({picture}, _args, {dataLoader}) => {
    if (!picture) return null
    return dataLoader.get('fileStoreAsset').load(picture)
  }
}

export default NotifyRequestToJoinOrg
