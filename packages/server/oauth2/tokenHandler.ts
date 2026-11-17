import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {createHash, timingSafeEqual} from 'crypto'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {selectOAuthAPIProvider} from '../postgres/select'
import type {Oauthscopeenum} from '../postgres/types/pg'
import encodeAuthToken from '../utils/encodeAuthToken'
import issueOAuthTokens from './issueOAuthTokens'
import rotateOAuthRefreshToken from './rotateOAuthRefreshToken'
import upsertOAuthAPIGrant from './upsertOAuthAPIGrant'

const CODE_VERIFIER = /^[A-Za-z0-9\-._~]{43,128}$/

const isEqualSecret = (expected: string | null | undefined, actual: string) => {
  if (!expected) return false
  const expectedBytes = Buffer.from(expected)
  const actualBytes = Buffer.from(actual)
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes)
}

const writeJSON = (res: HttpResponse, status: string, body: Record<string, string>) => {
  res.writeStatus(status)
  res.writeHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

const writeTokens = (res: HttpResponse, body: Record<string, string | number>) => {
  res.writeStatus('200 OK')
  res.writeHeader('Content-Type', 'application/json')
  res.writeHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

const getAuthenticatedClient = async (clientId: string, clientSecret: string | undefined) => {
  const provider = await selectOAuthAPIProvider()
    .where('clientId', '=', clientId)
    .executeTakeFirst()
  if (!provider) return null
  const isAuthenticated =
    provider.clientType === 'public'
      ? !clientSecret
      : !!clientSecret && isEqualSecret(provider.clientSecret, clientSecret)
  return isAuthenticated ? provider : null
}

const tokenHandler = uWSAsyncHandler(async (res: HttpResponse, _req: HttpRequest) => {
  const rawBody = await parseBody({
    res,
    parser: (buffer: Buffer) => buffer.toString()
  })

  if (!rawBody) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({error: 'invalid_request', error_description: 'Request body is missing'})
    )
    return
  }

  const params = new URLSearchParams(rawBody)
  const body: Record<string, string> = {}
  params.forEach((value, key) => {
    body[key] = value
  })

  const {grant_type, code, redirect_uri, client_id, client_secret, code_verifier, refresh_token} =
    body
  const requestedResource = body.resource || null

  // SCIM OAuth client credentials
  if (grant_type === 'client_credentials') {
    if (!client_id || !client_secret) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_request'}))
      return
    }

    if (client_id.startsWith('prbl-scim-cid-') === false) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }

    const pg = getKysely()
    const saml = await pg
      .selectFrom('SAML')
      .selectAll()
      .where('scimOAuthClientId', '=', client_id)
      .executeTakeFirst()
    if (!saml || !saml.orgId || !isEqualSecret(saml.scimOAuthClientSecret, client_secret)) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }

    const scopes = ['scim']
    const authToken = new AuthToken({
      sub: saml.id,
      tms: [],
      scope: scopes,
      lifespan_ms: ms('30d'),
      aud: 'action-scim'
    })
    const accessToken = encodeAuthToken(authToken)

    res.writeStatus('200 OK')
    res.writeHeader('Content-Type', 'application/json')
    res.writeHeader('Cache-Control', 'no-store')
    res.end(
      JSON.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: ms('30d') / 1000,
        scope: scopes.join(' ')
      })
    )
    return
  }

  const isRefresh = grant_type === 'refresh_token'
  if (grant_type !== 'authorization_code' && !isRefresh) {
    writeJSON(res, '400 Bad Request', {error: 'unsupported_grant_type'})
    return
  }

  if (!client_id) {
    writeJSON(res, '400 Bad Request', {error: 'invalid_request'})
    return
  }

  const provider = await getAuthenticatedClient(client_id, client_secret)
  if (!provider) {
    writeJSON(res, '401 Unauthorized', {error: 'invalid_client'})
    return
  }

  if (isRefresh) {
    if (!refresh_token) {
      writeJSON(res, '400 Bad Request', {error: 'invalid_request'})
      return
    }
    const rotated = await rotateOAuthRefreshToken(refresh_token, provider.clientId)
    if (!rotated) {
      writeJSON(res, '400 Bad Request', {error: 'invalid_grant'})
      return
    }
    writeTokens(
      res,
      issueOAuthTokens({
        ...rotated,
        scopes: rotated.scopes.filter((scope) => provider.scopes.includes(scope)),
        clientId: provider.clientId,
        resource: rotated.resource || undefined
      })
    )
    return
  }

  if (!code || !redirect_uri) {
    writeJSON(res, '400 Bad Request', {error: 'invalid_request'})
    return
  }

  const oauthCode = await getKysely()
    .deleteFrom('OAuthAPICode')
    .where('id', '=', code)
    .where('clientId', '=', provider.clientId)
    .returning([
      'id',
      'userId',
      'expiresAt',
      'redirectUri',
      'codeChallenge',
      'resource',
      sql<Oauthscopeenum[]>`to_json(scopes)`.as('scopes')
    ])
    .executeTakeFirst()
  if (!oauthCode) {
    writeJSON(res, '400 Bad Request', {error: 'invalid_grant'})
    return
  }

  if (new Date(oauthCode.expiresAt) < new Date()) {
    writeJSON(res, '400 Bad Request', {error: 'invalid_grant', error_description: 'Code expired'})
    return
  }

  if (oauthCode.redirectUri !== redirect_uri) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_grant',
      error_description: 'Redirect URI mismatch'
    })
    return
  }

  const {codeChallenge} = oauthCode
  const isCodeVerifierValid = codeChallenge
    ? !!code_verifier &&
      CODE_VERIFIER.test(code_verifier) &&
      isEqualSecret(codeChallenge, createHash('sha256').update(code_verifier).digest('base64url'))
    : provider.clientType === 'confidential' && !code_verifier
  if (!isCodeVerifierValid) {
    writeJSON(res, '400 Bad Request', {
      error: 'invalid_grant',
      error_description: 'Code verifier mismatch'
    })
    return
  }

  const {scopes, userId, resource} = oauthCode
  if (requestedResource && requestedResource !== resource) {
    writeJSON(res, '400 Bad Request', {error: 'invalid_target'})
    return
  }
  const {grantId, refreshToken} = await upsertOAuthAPIGrant({
    clientId: provider.clientId,
    userId,
    scopes,
    grantedOrgIds: [provider.orgId],
    resource: resource || null
  })
  writeTokens(
    res,
    issueOAuthTokens({
      grantId,
      userId,
      scopes,
      clientId: provider.clientId,
      resource: resource || undefined,
      refreshToken
    })
  )
})

export default tokenHandler
