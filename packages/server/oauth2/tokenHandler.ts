import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import crypto from 'crypto'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import encodeAuthToken from '../utils/encodeAuthToken'

function verifyCodeChallenge(codeVerifier: string, storedChallenge: string): boolean {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()
  const computed = hash.toString('base64url')
  return computed === storedChallenge
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
    if (!saml || !saml.orgId || saml.scimOAuthClientSecret !== client_secret) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }

    const scopes = ['scim']
    const authToken = new AuthToken({
      sub: saml.orgId,
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

  if (!code || !redirect_uri || !client_id) {
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

  if (!provider) {
    res.writeStatus('401 Unauthorized')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({error: 'invalid_client'}))
    return
  }

  if (provider.clientType === 'public') {
    // Public clients must not send client_secret and must send code_verifier
    if (client_secret) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'Public clients must not send client_secret'
        })
      )
      return
    }
    if (!code_verifier) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'invalid_request',
          error_description: 'Public clients must send code_verifier'
        })
      )
      return
    }
  } else {
    // Confidential clients must send client_secret
    if (!client_secret) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_request'}))
      return
    }
    if (provider.clientSecret !== client_secret) {
      res.writeStatus('401 Unauthorized')
      res.writeHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }
  }

  const oauthCode = await pg
    .deleteFrom('OAuthAPICode')
    .where('id', '=', code)
    .returning([
      'id',
      'userId',
      'expiresAt',
      'redirectUri',
      'codeChallenge',
      'codeChallengeMethod',
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

  if (provider.clientType === 'public') {
    if (!oauthCode.codeChallenge) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: 'No code challenge stored for this code'
        })
      )
      return
    }
    if (!verifyCodeChallenge(code_verifier!, oauthCode.codeChallenge)) {
      res.writeStatus('400 Bad Request')
      res.writeHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Code verifier does not match code challenge'
        })
      )
      return
    }
  }

  const {scopes, userId} = oauthCode
  const authToken = new AuthToken({
    sub: userId,
    tms: [],
    scope: scopes,
    lifespan_ms: ms('30d'),
    aud: 'action-oauth2'
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
