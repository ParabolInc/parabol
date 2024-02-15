import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import {URL} from 'url'
import {DataLoaderWorker} from '../graphql/graphql'
import RootDataLoader from '../dataloader/RootDataLoader'

const urlWithRelayState = (url: string, isInvited?: boolean | null) => {
  if (!isInvited) return url
  const relayState = base64url.encode(JSON.stringify({isInvited: true}))
  const urlObj = new URL(url)
  urlObj.searchParams.append('RelayState', relayState)
  return urlObj.toString()
}

const getSAMLURLFromEmail = async (
  email: string,
  dataLoader: RootDataLoader | DataLoaderWorker,
  isInvited?: boolean | null
) => {
  const domainName = getSSODomainFromEmail(email)
  if (!domainName) return null
  const saml = await dataLoader.get('samlByDomain').load(domainName)
  if (!saml) return null
  const {url} = saml
  if (!url) return null
  return urlWithRelayState(url, isInvited)
}

export default getSAMLURLFromEmail
