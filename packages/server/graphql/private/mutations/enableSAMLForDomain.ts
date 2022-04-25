import * as samlify from 'samlify'
import {v4 as uuid} from 'uuid'
import zlib from 'zlib'
import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const getURLWithSAMLRequestParam = (destination: string, slug: string) => {
  const template = `
  <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${uuid()}" Version="2.0" IssueInstant="${new Date().toISOString()}" Destination="${destination}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="https://${
    process.env.HOST
  }/saml/${slug}">
  <saml:Issuer>https://${process.env.HOST}/saml-metadata/${slug}</saml:Issuer>
      <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="false"/>
  </samlp:AuthnRequest>
  `
  const SAMLRequest = zlib.deflateRawSync(template).toString('base64')
  const url = new URL(destination)
  // appending a SAMLRequest that is _not_ URI encoded
  url.searchParams.append('SAMLRequest', SAMLRequest)
  // calling toString will URI encode everything for us!
  return url.toString()
}

const normalizeName = (name: string) => {
  const normalizedName = name.trim().toLowerCase()
  const nameRegex = /^[a-z0-9_-]+$/
  if (!nameRegex.test(normalizedName)) {
    return new Error('Name must be letters and numbers or _ or - with no spaces')
  }
  return normalizedName
}

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
    .run()
  if (domainOwner) return new Error(`Domain is already owned by ${domainOwner.id}`)
  return normalizedDomains
}

const getSignOnURL = (metadata: string | null | undefined, slugName: string) => {
  if (!metadata) return undefined
  const idp = samlify.IdentityProvider({metadata})
  const {singleSignOnService} = idp.entityMeta.meta
  const [fallbackKey] = Object.keys(singleSignOnService)
  if (!fallbackKey) {
    return new Error('Invalid metadata. Does not contain sign on URL')
  }
  const postKey = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
  const inputURL = singleSignOnService[postKey] || singleSignOnService[fallbackKey]
  try {
    new URL(inputURL)
  } catch (e) {
    return new Error(`Invalid Sign on URL: ${inputURL}`)
  }
  return getURLWithSAMLRequestParam(inputURL, slugName)
}

const enableSAMLForDomain: MutationResolvers['enableSAMLForDomain'] = async (
  _source,
  {name, domains, metadata}
) => {
  const r = await getRethink()

  // VALIDATION
  const slugName = normalizeName(name)
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
      .insert({id: slugName, domains: normalizedDomains, metadata: metadata, signOnURL})
      .run()
  }

  return {success: true}
}

export default enableSAMLForDomain
