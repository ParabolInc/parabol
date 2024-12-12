import base64url from 'base64url'
import getSSODomainFromEmail from 'parabol-client/utils/getSSODomainFromEmail'
import {URL} from 'url'
import {DataLoaderWorker} from '../graphql/graphql'
import getSignOnURL from '../graphql/public/mutations/helpers/SAMLHelpers/getSignOnURL'
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
    const instanceRes = await pg
      .selectFrom('SAML')
      .select(['id', 'metadata'])
      .where('metadata', 'is not', null)
      .limit(1)
      .executeTakeFirst()
    if (!instanceRes) return null
    const {id, metadata} = instanceRes
    if (!metadata) return null
    const instanceURL = getSignOnURL(metadata, id)
    if (instanceURL instanceof Error) return null
    return urlWithRelayState(instanceURL, isInvited)
  }
  if (!email) return null
  const domainName = getSSODomainFromEmail(email)
  if (!domainName) return null

  const saml = await dataLoader.get('samlByDomain').load(domainName)
  if (!saml) return null
  const {id, metadata} = saml
  if (!metadata) return null
  const url = getSignOnURL(metadata, id)
  if (url instanceof Error) return null
  return urlWithRelayState(url, isInvited)
}

export default getSAMLURLFromEmail
