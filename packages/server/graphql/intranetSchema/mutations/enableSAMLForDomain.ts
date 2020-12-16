import {GraphQLNonNull, GraphQLString, GraphQLList, GraphQLBoolean} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import validateXML from '~/utils/validateXML'
import validateURL from '~/utils/validateURL'

const AZURE_AD_LOGIN_URL_HOSTNAME = `microsoftonline`

const isMicrosoft = (url: string): boolean =>
  new URL(url).hostname.includes(AZURE_AD_LOGIN_URL_HOSTNAME)

const getMicrosoftSAMLRequestParam = async (destination: string, slug: string): Promise<string> => {
  const zlib = await import('zlib')
  const uuidv4 = (await import('uuid')).default.v4
  const template = `
  <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${uuidv4()}" Version="2.0" IssueInstant="${new Date().toISOString()}" Destination="${destination}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="https://action.parabol.co/saml/${slug}">
  <saml:Issuer>https://action.parabol.co/saml-metadata/${slug}</saml:Issuer>
      <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="false"/>
  </samlp:AuthnRequest>
  `
  return encodeURIComponent(zlib.deflateRawSync(template).toString('base64'))
}

const validateSlug = async (slug: string): Promise<{error?: string}> => {
  const r = await getRethink()
  const exists = await r.table('SAML').getAll(slug.toLowerCase()).count().eq(1).run()
  if (exists) return {error: 'that slug is already taken'}
  return {}
}

const validateDomains = async (domains: string[]): Promise<{error?: string}> => {
  const usedDomains = [] as string[]
  const r = await getRethink()
  for (const domain of domains) {
    const used = await r.table('SAML').getAll(domain, {index: 'domains'}).count().ge(1).run()
    if (used) usedDomains.push(domain)
  }
  if (usedDomains.length) {
    return {error: `these domains have already been claimed: ${usedDomains}`}
  }
  return {}
}

const enableSAMLForDomain = {
  type: GraphQLNonNull(GraphQLString),
  description: 'Enable SAML for domain',
  args: {
    url: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the IdP url the user will be redirected to to log in'
    },
    clientSlug: {
      type: GraphQLNonNull(GraphQLString),
      description: 'a unique slug for path of parabol url to sign in'
    },
    domains: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLString))),
      description:
        'completely sets OR resets the list of domains the client wants SSO turned on for'
    },
    metadata: {
      type: GraphQLNonNull(GraphQLString),
      description: "xml metadata containing the client's X509Certificate"
    },
    force: {
      type: GraphQLBoolean,
      description: 'set to true if you want to bypass all validation'
    }
  },
  async resolve(_source, {url, clientSlug, domains, metadata, force}) {
    const normalizedSlug = clientSlug.toLowerCase()
    const normalizedDomains = domains.map((d) => d.toLowerCase())

    // VALIDATION
    if (!force) {
      const {error: urlError} = validateURL(url)
      if (urlError) return `Got invalid url for url field`
      const {error: slugError} = await validateSlug(normalizedSlug)
      if (slugError) return `Got invalid slug: [${slugError}]`
      const {error: xmlError} = validateXML(metadata)
      if (xmlError) return `Got invalid xml for metadata field: [${xmlError}]`
      const {error: domainsError} = await validateDomains(normalizedDomains)
      if (domainsError) return `Got invalid value(s) for domains field: [${domainsError}]`
    }

    // RESOLUTION
    const r = await getRethink()
    if (isMicrosoft(url)) {
      const paramValue = await getMicrosoftSAMLRequestParam(url, normalizedSlug)
      url = `${url}?SAMLRequest=${paramValue}`
    }
    const now = new Date()
    const saml = {
      domains: normalizedDomains,
      url,
      metadata,
      updatedAt: now
    }

    await r
      .table('SAML')
      .insert({id: normalizedSlug, ...saml})
      .do((changes) =>
        r.branch(
          changes('inserted').eq(1),
          r.table('SAML').getAll(normalizedSlug).update({createdAt: now}),
          r.table('SAML').getAll(normalizedSlug).update(saml)
        )
      )
      .run()

    return 'success'
  }
}

export default enableSAMLForDomain
