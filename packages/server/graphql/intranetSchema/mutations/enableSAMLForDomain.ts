import {GraphQLNonNull, GraphQLString} from 'graphql'
import getRethink from '../../../database/rethinkDriver'
import isXML from '~/utils/isXML'

const AZURE_AD_LOGIN_URL_HOSTNAME = `microsoftonline`

const isMicrosoft = (url: string): boolean =>
  new URL(url).hostname.includes(AZURE_AD_LOGIN_URL_HOSTNAME)

const addMicrosoftSAMLRequestParam = async (url: string, client: string): Promise<string> => {
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
  const deflateEncoded = zlib.deflateRawSync(template).toString('base64')
  return `${url}?SAMLRequest=${encodeURIComponent(deflateEncoded)}`
}

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
    const r = await getRethink()
    const normalizedDomain = domain.toLowerCase()
    if (isMicrosoft(url)) url = await addMicrosoftSAMLRequestParam(url, normalizedDomain)
    // todo: check if domain has any . in it (it shouldnt)
    const {error} = isXML(metadata)
    if (error) return `Got invalid xml for metadata field: [${error}]`

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
