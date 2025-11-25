import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {sign} from 'jsonwebtoken'
import {Kysely} from 'kysely'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'
import type {DB} from './dbTypes'

const SERVER_SECRET = process.env.SERVER_SECRET!

const tokenHandler = async (res: HttpResponse, _req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  try {
    const url = _req.getUrl()
    const method = _req.getMethod()

    console.log(`[OAuth Token] Request: ${method} ${url}`)
    console.log(`[OAuth Token] Headers:`, {
      'content-type': _req.getHeader('content-type'),
      'user-agent': _req.getHeader('user-agent')
    })

    // Use custom parser to get raw string for form-urlencoded data
    const rawBody = await parseBody({
      res,
      parser: (buffer: Buffer) => buffer.toString()
    })

    if (!rawBody) {
      console.log('[OAuth Token] Error: Missing request body')
      res.writeStatus('400 Bad Request')
      res.end(
        JSON.stringify({error: 'invalid_request', error_description: 'Request body is missing'})
      )
      return
    }

    // Parse form-urlencoded data
    const params = new URLSearchParams(rawBody)
    const body: any = {}
    params.forEach((value, key) => {
      body[key] = value
    })

    // Log body with redacted secrets
    const redactedBody = {...body}
    if (redactedBody.client_secret) redactedBody.client_secret = '[REDACTED]'
    if (redactedBody.code) redactedBody.code = '[REDACTED]'
    console.log(`[OAuth Token] Body:`, JSON.stringify(redactedBody, null, 2))

    const {grant_type, code, redirect_uri, client_id, client_secret} = body

    if (grant_type !== 'authorization_code') {
      console.log(`[OAuth Token] Error: Unsupported grant type "${grant_type}"`)
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'unsupported_grant_type'}))
      return
    }

    if (!code || !redirect_uri || !client_id || !client_secret) {
      console.log('[OAuth Token] Error: Missing required parameters')
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_request'}))
      return
    }

    // 1. Validate Client Credentials
    const db = getKysely() as unknown as Kysely<DB>
    const org = await db
      .selectFrom('Organization')
      .selectAll()
      .where('oauthClientId', '=', client_id)
      .executeTakeFirst()

    if (!org || org.oauthClientSecret !== client_secret) {
      console.log(`[OAuth Token] Error: Invalid client credentials for client_id "${client_id}"`)
      res.writeStatus('401 Unauthorized')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }

    // 2. Validate Code
    const oauthCode = await db
      .selectFrom('OAuthCode')
      .selectAll()
      .where('id', '=', code)
      .executeTakeFirst()

    if (!oauthCode) {
      console.log(`[OAuth Token] Error: Invalid authorization code`)
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant'}))
      return
    }

    // 3. Validate Code Expiration
    const now = Math.floor(Date.now() / 1000)
    if (oauthCode.expiresAt < now) {
      console.log(`[OAuth Token] Error: Authorization code expired`)
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Code expired'}))
      return
    }

    // 4. Validate Redirect URI
    if (!org.oauthRedirectUris || !org.oauthRedirectUris.includes(redirect_uri)) {
      console.log(
        `[OAuth Token] Error: Redirect URI mismatch. Expected one of ${JSON.stringify(org.oauthRedirectUris)}, got "${redirect_uri}"`
      )
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Redirect URI mismatch'}))
      return
    }

    // Generate Access Token
    const userId = oauthCode.userId
    const tokenPayload = {
      sub: userId,
      aud: 'action',
      iss: 'parabol-oauth2',
      exp: now + 60 * 60 * 24 * 30, // 30 days
      iat: now,
      scp: oauthCode.scopes
    }

    const accessToken = sign(tokenPayload, Buffer.from(SERVER_SECRET, 'base64'))

    // 6. Delete Used Code
    await db.deleteFrom('OAuthCode').where('id', '=', code).execute()

    console.log(
      `[OAuth Token] Success: Token issued for user ${userId} with scopes ${JSON.stringify(oauthCode.scopes)}`
    )

    res.writeStatus('200 OK')
    res.writeHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: oauthCode.scopes.join(' ')
      })
    )
  } catch (error) {
    console.error('[OAuth Token] Server Error:', error)
    Logger.error('OAuth Token Error', error)
    res.writeStatus('500 Internal Server Error')
    res.end(JSON.stringify({error: 'server_error'}))
  }
}

export default tokenHandler
