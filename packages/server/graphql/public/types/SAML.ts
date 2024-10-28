import {Selectable} from 'kysely'
import {SAML as TSAML} from '../../../postgres/types/pg'
import {SamlResolvers} from '../resolverTypes'

export interface SAMLSource extends Selectable<TSAML> {
  domains: string[]
}

const SAML: SamlResolvers = {
  lastUpdatedByUser: async ({lastUpdatedBy}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(lastUpdatedBy)
  },
  metadataURL: ({metadataURL, metadata}) => {
    if (metadataURL) return metadataURL
    if (metadata) return 'Unknown'
    return null
  },
  organization: async ({orgId}, _args, {dataLoader}) => {
    if (!orgId) return null
    return dataLoader.get('organizations').loadNonNull(orgId)
  }
}

export default SAML
