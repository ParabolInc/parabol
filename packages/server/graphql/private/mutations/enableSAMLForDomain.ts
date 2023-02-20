import getRethink from '../../../database/rethinkDriver'
import getSignOnURL from '../../public/mutations/helpers/SAMLHelpers/getSignOnURL'
import {MutationResolvers} from '../resolverTypes'
import normalizeSlugName from './helpers/normalizeSlugName'

const validateDomains = async (domains: string[] | null | undefined, slugName: string) => {
  if (!domains) return undefined
  const r = await getRethink()

  const normalizedDomains = domains.map((domain) => domain.toLowerCase())
  const domainOwner = await r
    .table('SAML')
    .getAll(r.args(normalizedDomains), {index: 'domains'})
    .filter((row) => row('id').ne(slugName))
    .limit(1)
    .nth(0)
    .default(null)
    .run()
  if (domainOwner) return new Error(`Domain is already owned by ${domainOwner.id}`)
  return normalizedDomains
}

const enableSAMLForDomain: MutationResolvers['enableSAMLForDomain'] = async (
  _source,
  {name, domains, metadata}
) => {
  const r = await getRethink()

  // VALIDATION
  const slugName = normalizeSlugName(name)
  if (slugName instanceof Error) return {error: {message: slugName.message}}

  const signOnURL = getSignOnURL(metadata, slugName)
  if (signOnURL instanceof Error) return {error: {message: signOnURL.message}}

  const normalizedDomains = await validateDomains(domains, slugName)
  if (normalizedDomains instanceof Error) return {error: {message: normalizedDomains.message}}

  // RESOLUTION
  const existingRecord = await r.table('SAML').get(slugName).run()
  if (existingRecord) {
    await r
      .table('SAML')
      .get(slugName)
      .update({
        domains: normalizedDomains,
        url: signOnURL,
        metadata: metadata || undefined
      })
      .run()
  } else {
    if (!normalizedDomains) return {error: {message: 'domains is required for new SAML customers'}}
    if (!metadata || !signOnURL) return {error: {message: 'Invalid metadata'}}
    await r
      .table('SAML')
      .insert({
        id: slugName,
        domains: normalizedDomains,
        metadata: metadata,
        url: signOnURL
      })
      .run()
  }

  return {success: true}
}

export default enableSAMLForDomain
