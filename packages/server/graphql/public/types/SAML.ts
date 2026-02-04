import type {Selectable} from 'kysely'
import type {SAML as TSAML} from '../../../postgres/types/pg'
import {censorBearerToken, censorOAuthClientSecret} from '../../../scim/credentials'
import type {SamlResolvers} from '../resolverTypes'

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
  },
  scimCensoredOAuthClientSecret: ({scimOAuthClientSecret}) => {
    return censorOAuthClientSecret(scimOAuthClientSecret)
  },
  scimCensoredBearerToken: ({scimBearerToken}) => {
    return censorBearerToken(scimBearerToken)
  }
}

export default SAML
