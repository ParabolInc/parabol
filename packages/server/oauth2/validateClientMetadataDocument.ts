import {isRedirectUriValid} from '../graphql/public/types/RedirectURI'

const MAX_CLIENT_ID_LENGTH = 255
const MAX_REDIRECT_URI_LENGTH = 2048

// href === url rejects dot segments and any other spelling new URL() rewrites, so a document
// has exactly one client_id
export const isClientMetadataDocumentUrl = (url: string) => {
  if (url.length > MAX_CLIENT_ID_LENGTH || url.includes('#')) return false
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.pathname !== '/' &&
      !parsed.username &&
      !parsed.password &&
      parsed.href === url
    )
  } catch {
    return false
  }
}

export const isMetadataDocumentRedirectUri = (uri: string) =>
  uri.length <= MAX_REDIRECT_URI_LENGTH && isRedirectUriValid(uri)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export interface ClientMetadata {
  clientName: string
  redirectUris: string[]
}

const validateClientMetadataDocument = (
  url: string,
  json: unknown
): ClientMetadata | {error: string} => {
  if (!isClientMetadataDocumentUrl(url)) {
    return {
      error: 'Invalid client_id: a metadata document URL is https, with a path and no fragment'
    }
  }
  if (!isRecord(json) || json.client_id !== url) {
    return {error: 'Invalid client_id: its metadata document names a different client_id'}
  }
  const {redirect_uris: listedRedirectUris, token_endpoint_auth_method: authMethod} = json
  if (
    !Array.isArray(listedRedirectUris) ||
    !listedRedirectUris.every((uri): uri is string => typeof uri === 'string')
  ) {
    return {error: 'Invalid client_id: its metadata document lists no redirect_uris'}
  }
  if (authMethod !== undefined && authMethod !== 'none') {
    return {
      error: 'Invalid client_id: its metadata document must use token_endpoint_auth_method none'
    }
  }
  const redirectUris = listedRedirectUris.filter(isMetadataDocumentRedirectUri)
  return {clientName: new URL(url).host, redirectUris}
}

export default validateClientMetadataDocument
