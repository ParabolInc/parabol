import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import isXML from '~/utils/isXML'

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

const validDomain = (domain: string): boolean => !domain.includes('.')

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
    if (!validDomain(domain)) {
      return `Invalid domain. Please remove any top-level domain or subdomain`
    }
    const {error: xmlError} = isXML(metadata)
    if (xmlError) return `Got invalid xml for metadata field: [${xmlError}]`

    // RESOLUTION
    const r = await getRethink()
    const normalizedDomain = domain.toLowerCase()
    if (isMicrosoft(url)) {
      const paramValue = await getMicrosoftSAMLRequestParam(url, normalizedDomain)
      url = `${url}?SAMLRequest=${paramValue}`
    }

    await r
      .table('SAML')
      .insert(
        {
          id: normalizedDomain,
          domain: normalizedDomain,
          url,
          metadata
        },
        {conflict: 'replace'}
      )
      .run()

    return 'success'
  }
}

export default enableSAMLForDomain
