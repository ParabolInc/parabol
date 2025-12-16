import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {sql} from 'kysely'
import ms from 'ms'
import AuthToken from '../database/types/AuthToken'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import encodeAuthToken from '../utils/encodeAuthToken'

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
      res.writeHeader('content-type', 'application/json')
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

    // 2. Validate Code (atomically delete to prevent replay attacks)
    const [codeId] = CipherId.fromClient(code)
    const oauthCode = await pg
      .deleteFrom('OAuthAPICode')
      .where('id', '=', codeId)
      .returning(['id', 'userId', 'expiresAt', sql<string[]>`to_json(scopes)`.as('scopes')])
      .executeTakeFirst()

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
    if (!provider.redirectUris.includes(redirect_uri)) {
      res.writeStatus('400 Bad Request')
      res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Redirect URI mismatch'}))
      return
    }

    // 5. Ensure scopes is an array (should always be true with to_json)
    const {scopes, userId} = oauthCode

    // Generate Access Token
    const authToken = new AuthToken({
      sub: userId,
      tms: [],
      scp: scopes,
      lifespan_ms: ms('30d'),
      aud: 'action-oauth2'
    })

    const accessToken = encodeAuthToken(authToken)

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
