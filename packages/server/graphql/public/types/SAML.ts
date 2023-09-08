import {Selectable} from 'kysely'
import {SamlResolvers} from '../resolverTypes'
import {SAML} from '../../../postgres/pg.d'
export interface SAMLSource extends Selectable<SAML> {
  domains: string[]
}

const SAML: SamlResolvers = {
  lastUpdatedByUser: async ({lastUpdatedBy}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(lastUpdatedBy)
  },
  organization: async ({orgId}, _args, {dataLoader}) => {
    if (!orgId) return null
    return dataLoader.get('organizations').load(orgId)
  }
}

export default SAML
