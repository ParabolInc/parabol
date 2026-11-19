import type {OAuthAPIProvider} from '../postgres/types'

const LOOPBACK_HOSTS = ['127.0.0.1', '[::1]', 'localhost']

const withoutLoopbackPort = (uri: string) => {
  try {
    const url = new URL(uri)
    if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.includes(url.hostname)) return null
    url.port = ''
    return url.href
  } catch {
    return null
  }
}

// RFC 8252 §7.3: a native app picks its loopback port at runtime
const isRegisteredRedirectUri = (
  provider: Pick<OAuthAPIProvider, 'clientType' | 'redirectUris'>,
  redirectUri: string
) => {
  if (provider.redirectUris.includes(redirectUri)) return true
  if (provider.clientType !== 'public') return false
  const requested = withoutLoopbackPort(redirectUri)
  return (
    !!requested &&
    provider.redirectUris.some((registered) => withoutLoopbackPort(registered) === requested)
  )
}

export default isRegisteredRedirectUri
