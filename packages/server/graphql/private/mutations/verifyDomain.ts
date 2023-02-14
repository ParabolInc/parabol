import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'
import normalizeSlugName from './helpers/normalizeSlugName'

const verifyDomain: MutationResolvers['verifyDomain'] = async (_source, {slug, domains, orgId}) => {
  const r = await getRethink()
  const normalizedDomains = domains.map((domain) => domain.toLowerCase())

  // VALIDATION
  const slugName = normalizeSlugName(slug)
  if (slugName instanceof Error) return {error: {message: slugName.message}}

  const [slugNameExist, orgIdExist] = await Promise.all([
    r.table('SAML')('id').count(slugName).eq(1).run(),
    r.table('SAML')('orgId').count(orgId).eq(1).run()
  ])
  if (slugNameExist) return {error: {message: 'SAML exist with slug name'}}
  if (orgIdExist) return {error: {message: 'SAML exist for organization'}}

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
