import getSAMLURLFromEmail from '../../../utils/getSAMLURLFromEmail'
import {QueryResolvers} from '../resolverTypes'

export interface SSORelayState {
  isInvited?: boolean
  metadataURL?: string
}

const SAMLIdP: QueryResolvers['SAMLIdP'] = async (_source, {email, isInvited}, {dataLoader}) => {
  return getSAMLURLFromEmail(email, dataLoader, isInvited)
}

export default SAMLIdP
