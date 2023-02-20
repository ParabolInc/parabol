import * as samlify from 'samlify'
import getURLWithSAMLRequestParam from './getURLWithSAMLRequestParam'

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

export default getSignOnURL
