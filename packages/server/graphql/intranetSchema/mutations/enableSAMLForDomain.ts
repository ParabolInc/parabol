import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import validateXML from '~/utils/validateXML'
import validateURL from '~/utils/validateURL'

const AZURE_AD_LOGIN_URL_HOSTNAME = `microsoftonline`

const isMicrosoft = (url: string): boolean =>
  new URL(url).hostname.includes(AZURE_AD_LOGIN_URL_HOSTNAME)

const getMicrosoftSAMLRequestParam = async (url: string, client: string): Promise<string> => {
  const zlib = await import('zlib')
  const uuidv4 = (await import('uuid')).default.v4
  const template = `
  <samlp:AuthnRequest
      xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
      xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_${uuidv4()}" Version="2.0" IssueInstant="${new Date().toISOString()}" Destination="${url}" ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" AssertionConsumerServiceURL="https://action.parabol.co/saml/${client}">
  <saml:Issuer>https://action.parabol.co/saml-metadata/${client}</saml:Issuer>
      <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="false"/>
  </samlp:AuthnRequest>
  `
  return encodeURIComponent(zlib.deflateRawSync(template).toString('base64'))
}

const validateDomain = (domain: string): {error?: string} =>
  domain.includes('.') ? {error: 'top-level domain or subdomain detected'} : {}

const enableSAMLForDomain = {
  type: new GraphQLNonNull(GraphQLString),
  description: 'Enable SAML for domain',
  args: {
    url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    domain: {
      type: GraphQLNonNull(GraphQLString)
    },
    metadata: {
      type: GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {url, domain, metadata}) {
    // VALIDATION
    const {error: urlError} = validateURL(url)
    if (urlError) return `Got invalid url for url field`
    const {error: domainError} = validateDomain(domain)
    if (domainError) return `Got invalidate domain: [${domainError}]`
    const {error: xmlError} = validateXML(metadata)
    if (xmlError) return `Got invalid xml for metadata field: [${xmlError}]`

    // RESOLUTION
    const r = await getRethink()
    const normalizedDomain = domain.toLowerCase()
    if (isMicrosoft(url)) {
      const paramValue = await getMicrosoftSAMLRequestParam(url, normalizedDomain)
      url = `${url}?SAMLRequest=${paramValue}`
    }
    const now = new Date()

    const inserted = await r
      .table('SAML')
      .insert(
        {
          id: normalizedDomain,
          domain: normalizedDomain,
          url,
          metadata,
          updatedAt: now
        },
        {conflict: 'update', returnChanges: true}
      )('inserted')
      .run()

    if (inserted) {
      await r.table('SAML').getAll(normalizedDomain).update({createdAt: now}).run()
    }

    return 'success'
  }
}

export default enableSAMLForDomain
