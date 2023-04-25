import {v4 as uuid} from 'uuid'
import zlib from 'zlib'

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

export default getURLWithSAMLRequestParam
