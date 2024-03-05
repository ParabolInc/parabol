import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import {URL} from 'url'
import {DataLoaderWorker} from '../graphql/graphql'
import getKysely from '../postgres/getKysely'

export const isSingleTenantSSO =
  process.env.AUTH_INTERNAL_DISABLED === 'true' &&
  process.env.AUTH_GOOGLE_DISABLED === 'true' &&
  process.env.AUTH_MICROSOFT_DISABLED === 'true' &&
  process.env.AUTH_SSO_DISABLED === 'false'

const urlWithRelayState = (url: string, isInvited?: boolean | null) => {
  if (!isInvited) return url
  const relayState = base64url.encode(JSON.stringify({isInvited: true}))
  const urlObj = new URL(url)
  urlObj.searchParams.append('RelayState', relayState)
  return urlObj.toString()
}

const getSAMLURLFromEmail = async (
  email: string | null | undefined,
  dataLoader: DataLoaderWorker,
  isInvited?: boolean | null
) => {
  if (isSingleTenantSSO) {
    // For PPMI use
    const pg = getKysely()
    const instanceURLres = await pg
      .selectFrom('SAML')
      .select('url')
      .where('url', 'is not', null)
      .limit(1)
      .executeTakeFirst()
    const instanceURL = instanceURLres?.url
    if (!instanceURL) return null
    return urlWithRelayState(instanceURL, isInvited)
  }
  if (!email) return null
  const domainName = getSSODomainFromEmail(email)
  if (!domainName) return null

  const saml = await dataLoader.get('samlByDomain').load(domainName)
  if (!saml) return null
  const {url} = saml
  if (!url) return null
  return urlWithRelayState(url, isInvited)
}

export default getSAMLURLFromEmail
