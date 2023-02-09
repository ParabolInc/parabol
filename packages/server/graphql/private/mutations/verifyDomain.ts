import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'
import {normalizeSlugName} from './helpers/SAMLHelpers'

const verifyDomain: MutationResolvers['verifyDomain'] = async (_source, {slug, domains, orgId}) => {
  const r = await getRethink()
  const normalizedDomains = domains.map((domain) => domain.toLowerCase())

  // VALIDATION
  const slugName = normalizeSlugName(slug)
  if (slugName instanceof Error) return {error: {message: slugName.message}}

  const organizationSAMLExist = await r.table('SAML').get(slugName).run()
  if (organizationSAMLExist) return {error: {message: 'SAML exist for organization'}}

  await r
    .table('SAML')
    .insert({
      orgId,
      domains: normalizedDomains,
      id: slugName
    })
    .run()

  return {success: true}
}

export default verifyDomain
