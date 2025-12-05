export function validateRedirectUri(uri: string): boolean {
  try {
    const url = new URL(uri)

    // Allow https and http for localhost only
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    const hasValidProtocol = url.protocol === 'https:' || (isLocalhost && url.protocol === 'http:')

    if (!hasValidProtocol) {
      return false
    }

    // Reject URIs with fragments
    if (url.hash) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function validateRedirectUris(uris: string[]): boolean {
  if (!uris || uris.length === 0) {
    return false
  }

  return uris.every(validateRedirectUri)
}
