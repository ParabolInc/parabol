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
    // Use custom parser to get raw string for form-urlencoded data
    const rawBody = await parseBody({
      res,
      parser: (buffer: Buffer) => buffer.toString()
    })

    if (!rawBody) {
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

    const {grant_type, code, redirect_uri, client_id, client_secret} = body

    if (grant_type !== 'authorization_code') {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'unsupported_grant_type'}))
      return
    }

    if (!code || !redirect_uri || !client_id || !client_secret) {
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
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant'}))
      return
    }

    // 3. Validate Code Expiration
    const now = Math.floor(Date.now() / 1000)
    if (oauthCode.expiresAt < now) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Code expired'}))
      return
    }

    // 4. Validate Redirect URI
    if (!org.oauthRedirectUris || !org.oauthRedirectUris.includes(redirect_uri)) {
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
    Logger.error('OAuth Token Error', error)
    res.writeStatus('500 Internal Server Error')
    res.end(JSON.stringify({error: 'server_error'}))
  }
}

export default tokenHandler
