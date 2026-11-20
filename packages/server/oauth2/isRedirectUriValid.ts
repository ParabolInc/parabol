import isLoopbackHostname from '../../client/utils/isLoopbackHostname'

const isRedirectUriValid = (uri: string) => {
  try {
    const url = new URL(uri)
    const isLoopbackHttp = url.protocol === 'http:' && isLoopbackHostname(url.hostname)
    return (url.protocol === 'https:' || isLoopbackHttp) && !url.hash
  } catch {
    return false
  }
}

export default isRedirectUriValid
