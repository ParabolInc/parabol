import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const normalizeName = (name: string) => {
  const normalizedName = name.trim().toLowerCase()
  const nameRegex = /^[a-z0-9_-]+$/
  if (!nameRegex.test(normalizedName)) {
    return new Error('Name must be letters and numbers or _ or - with no spaces')
  }
  return normalizedName
}

const verifyDomain: MutationResolvers['verifyDomain'] = async (_source, {slug, domains, orgId}) => {
  const r = await getRethink()
  const normalizedDomains = domains.map((domain) => domain.toLowerCase())

  // VALIDATION
  const slugName = normalizeName(slug)
  if (slugName instanceof Error) return {error: {message: slugName.message}}

  const organizationSAMLExist = await r.table('SAML').get(slugName).run()
  if (organizationSAMLExist) {
    await r.table('SAML').get(slugName).update({orgId: null}).run()
  }

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
