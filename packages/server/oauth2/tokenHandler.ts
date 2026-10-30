import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {createHash, timingSafeEqual} from 'crypto'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'

const CODE_VERIFIER = /^[A-Za-z0-9\-._~]{43,128}$/

const sha256 = (value: string) => createHash('sha256').update(value).digest()

const isEqualSecret = (expected: string | null | undefined, actual: string) =>
  !!expected && timingSafeEqual(sha256(expected), sha256(actual))

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

  const {grant_type, code, redirect_uri, client_id, client_secret, code_verifier} = body

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

  if (grant_type !== 'authorization_code') {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'unsupported_grant_type'}))
    return
  }

  if (!code || !redirect_uri || !client_id || !client_secret) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'invalid_request'}))
    return
  }

  const pg = getKysely()
  const provider = await pg
    .selectFrom('OAuthAPIProvider')
    .selectAll()
    .where('clientId', '=', client_id)
    .executeTakeFirst()
  if (!provider || !isEqualSecret(provider.clientSecret, client_secret)) {
    res.writeStatus('401 Unauthorized')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'invalid_client'}))
    return
  }

  const oauthCode = await pg
    .deleteFrom('OAuthAPICode')
    .where('id', '=', code)
    .where('clientId', '=', provider.clientId)
    .returning([
      'id',
      'userId',
      'expiresAt',
      'redirectUri',
      'codeChallenge',
      sql<string[]>`to_json(scopes)`.as('scopes')
    ])
    .executeTakeFirst()
  if (!oauthCode) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'invalid_grant'}))
    return
  }

  const now = new Date()
  const expiresAt = new Date(oauthCode.expiresAt)
  if (expiresAt < now) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Code expired'}))
    return
  }

  if (oauthCode.redirectUri !== redirect_uri) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Redirect URI mismatch'
      })
    )
    return
  }

  const {codeChallenge} = oauthCode
  const isCodeVerifierValid = codeChallenge
    ? !!code_verifier &&
      CODE_VERIFIER.test(code_verifier) &&
      isEqualSecret(codeChallenge, sha256(code_verifier).toString('base64url'))
    : !code_verifier
  if (!isCodeVerifierValid) {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Code verifier mismatch'
      })
    )
    return
  }

  const {scopes, userId} = oauthCode
  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: scopes,
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2',
    client_id: provider.clientId
  })
  const accessToken = encodeAuthToken(authToken)

  res.writeStatus('200 OK')
  res.writeHeader('Content-Type', 'application/json')
  res.end(
    JSON.stringify({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ms('30d') / 1000,
      scope: scopes.join(' ')
    })
  )
})

export default tokenHandler
