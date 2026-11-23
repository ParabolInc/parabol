import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import getRateLimiter from '../graphql/getRateLimiter'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import uwsGetIP from '../utils/uwsGetIP'
import {generateOAuthClientId} from './credentials'
import isRedirectUriValid from './isRedirectUriValid'
import writeJSON from './writeJSON'

const MAX_BODY_BYTES = 16 * 1024
const MAX_REGISTRATIONS_PER_MINUTE = 10
const MAX_REGISTRATIONS_PER_HOUR = 50
const MAX_REDIRECT_URIS = 10
const MAX_REDIRECT_URI_LENGTH = 2048
const MAX_CLIENT_NAME_LENGTH = 100
const GRANT_TYPES = ['authorization_code', 'refresh_token']
const RESPONSE_TYPES = ['code']

const isListOf = (allowed: string[], value: unknown) =>
  value === undefined || (Array.isArray(value) && value.every((item) => allowed.includes(item)))

const isRegisteredRedirectUri = (uri: unknown): uri is string =>
  typeof uri === 'string' && uri.length <= MAX_REDIRECT_URI_LENGTH && isRedirectUriValid(uri)

// RFC 7591 dynamic client registration, so an agent connects without anyone setting it up first
const registrationHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const ip = uwsGetIP(res, req)
  const {lastMinute, lastHour = 0} = getRateLimiter().log(
    `oauthRegistration:${ip}`,
    'oauthRegistration',
    true
  )
  if (lastMinute > MAX_REGISTRATIONS_PER_MINUTE || lastHour > MAX_REGISTRATIONS_PER_HOUR) {
    writeJSON(res, '429 Too Many Requests', {
      error: 'too_many_requests',
      error_description: 'Too many registrations from this address. Try again later'
    })
    return
  }
  const metadata = await parseBody<Record<string, unknown>>({res, maxBytes: MAX_BODY_BYTES})
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_client_metadata',
      error_description: 'The body must be a JSON object of client metadata'
    })
    return
  }
  const {
    redirect_uris: redirectUris,
    client_name: clientName,
    token_endpoint_auth_method: tokenEndpointAuthMethod,
    grant_types: grantTypes,
    response_types: responseTypes
  } = metadata
  if (
    !Array.isArray(redirectUris) ||
    redirectUris.length === 0 ||
    redirectUris.length > MAX_REDIRECT_URIS ||
    !redirectUris.every(isRegisteredRedirectUri)
  ) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_redirect_uri',
      error_description: `redirect_uris must list 1 to ${MAX_REDIRECT_URIS} URIs that use HTTPS, or HTTP to a loopback address, and have no fragment`
    })
    return
  }
  if (tokenEndpointAuthMethod !== undefined && tokenEndpointAuthMethod !== 'none') {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_client_metadata',
      error_description:
        'Clients authenticate with PKCE, so token_endpoint_auth_method must be none'
    })
    return
  }
  if (!isListOf(GRANT_TYPES, grantTypes) || !isListOf(RESPONSE_TYPES, responseTypes)) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_client_metadata',
      error_description: 'Only the authorization_code and refresh_token grants are supported'
    })
    return
  }
  const name =
    typeof clientName === 'string' ? clientName.replace(/\p{C}/gu, '').trim() : 'Unnamed app'
  if (!name || name.length > MAX_CLIENT_NAME_LENGTH) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_client_metadata',
      error_description: `client_name must be 1 to ${MAX_CLIENT_NAME_LENGTH} characters`
    })
    return
  }
  const clientId = generateOAuthClientId()
  const {createdAt} = await getKysely()
    .insertInto('OAuthAPIProvider')
    .values({clientId, name, redirectUris})
    .returning('createdAt')
    .executeTakeFirstOrThrow()
  writeJSON(res, '201 Created', {
    client_id: clientId,
    client_id_issued_at: Math.floor(createdAt.getTime() / 1000),
    client_name: name,
    redirect_uris: redirectUris,
    grant_types: GRANT_TYPES,
    response_types: RESPONSE_TYPES,
    token_endpoint_auth_method: 'none'
  })
})

export default registrationHandler
