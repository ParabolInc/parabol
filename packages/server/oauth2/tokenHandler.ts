import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {sign} from 'jsonwebtoken'
import ms from 'ms'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {selectOAuthAPICode} from '../postgres/select'

const SERVER_SECRET = process.env.SERVER_SECRET!

const tokenHandler = uWSAsyncHandler(async (res: HttpResponse, _req: HttpRequest) => {
  try {
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

    const params = new URLSearchParams(rawBody)
    const body: Record<string, string> = {}
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
    const pg = getKysely()
    const provider = await pg
      .selectFrom('OAuthAPIProvider')
      .selectAll()
      .where('clientId', '=', client_id)
      .executeTakeFirst()

    if (!provider || provider.clientSecret !== client_secret) {
      res.writeStatus('401 Unauthorized')
      res.end(JSON.stringify({error: 'invalid_client'}))
      return
    }

    // 2. Validate Code
    const oauthCode = await selectOAuthAPICode().where('id', '=', code).executeTakeFirst()

    if (!oauthCode) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant'}))
      return
    }

    // 3. Validate Code Expiration
    const now = new Date()
    const expiresAt = new Date(oauthCode.expiresAt)
    if (expiresAt < now) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Code expired'}))
      return
    }

    // 4. Validate Redirect URI
    if (!provider.redirectUris || !provider.redirectUris.includes(redirect_uri)) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Redirect URI mismatch'}))
      return
    }

    // 5. Ensure scopes is an array (should always be true with to_json)
    const scopes = Array.isArray(oauthCode.scopes) ? oauthCode.scopes : []

    // Generate Access Token
    const userId = oauthCode.userId
    const tokenPayload = {
      sub: userId,
      aud: 'action',
      iss: 'parabol-oauth2',
      exp: Math.floor(Date.now() / 1000) + ms('30d') / 1000,
      iat: Math.floor(Date.now() / 1000),
      scp: scopes
    }

    const accessToken = sign(tokenPayload, Buffer.from(SERVER_SECRET, 'base64'))

    // 6. Delete Used Code
    await pg.deleteFrom('OAuthAPICode').where('id', '=', code).execute()

    // 7. Respond with Access Token
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
  } catch (error) {
    console.error('Error in tokenHandler:', error)
    throw error
  }
})

export default tokenHandler
