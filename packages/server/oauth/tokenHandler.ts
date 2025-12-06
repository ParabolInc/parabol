import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {sign} from 'jsonwebtoken'
import parseBody from '../parseBody'
import getKysely from '../postgres/getKysely'
import {Logger} from '../utils/Logger'

const SERVER_SECRET = process.env.SERVER_SECRET!

const tokenHandler = async (res: HttpResponse, _req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  try {
    const rawBody = await parseBody({
      res,
      parser: (buffer: Buffer) => buffer.toString()
    })

    if (!rawBody) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(
          JSON.stringify({error: 'invalid_request', error_description: 'Request body is missing'})
        )
      })
      return
    }

    const params = new URLSearchParams(rawBody)
    const body: any = {}
    params.forEach((value, key) => {
      body[key] = value
    })

    const redactedBody = {...body}
    if (redactedBody.client_secret) redactedBody.client_secret = '[REDACTED]'
    if (redactedBody.code) redactedBody.code = '[REDACTED]'

    const {grant_type, code, redirect_uri, client_id, client_secret} = body

    if (grant_type !== 'authorization_code') {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(JSON.stringify({error: 'unsupported_grant_type'}))
      })
      return
    }

    if (!code || !redirect_uri || !client_id || !client_secret) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(JSON.stringify({error: 'invalid_request'}))
      })
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
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('401 Unauthorized')
        res.end(JSON.stringify({error: 'invalid_client'}))
      })
      return
    }

    // 2. Validate Code
    const oauthCode = await pg
      .selectFrom('OAuthAPICode')
      .selectAll()
      .where('id', '=', code)
      .executeTakeFirst()

    if (!oauthCode) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(JSON.stringify({error: 'invalid_grant'}))
      })
      return
    }

    // 3. Validate Code Expiration
    const now = new Date()
    const expiresAt = new Date(oauthCode.expiresAt)
    if (expiresAt < now) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(JSON.stringify({error: 'invalid_grant', error_description: 'Code expired'}))
      })
      return
    }

    // 4. Validate Redirect URI
    if (!provider.redirectUris || !provider.redirectUris.includes(redirect_uri)) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end(
          JSON.stringify({error: 'invalid_grant', error_description: 'Redirect URI mismatch'})
        )
      })
      return
    }

    // Generate Access Token
    const userId = oauthCode.userId
    const tokenPayload = {
      sub: userId,
      aud: 'action',
      iss: 'parabol-oauth2',
      exp: Math.floor(now.getTime() / 1000) + 60 * 60 * 24 * 30, // 30 days
      iat: Math.floor(now.getTime() / 1000),
      scp: oauthCode.scopes
    }

    const accessToken = sign(tokenPayload, Buffer.from(SERVER_SECRET, 'base64'))

    // 6. Delete Used Code
    await pg.deleteFrom('OAuthAPICode').where('id', '=', code).execute()

    // 7. Respond with Access Token
    if (res.aborted) return
    res.cork(() => {
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
    })
  } catch (error) {
    Logger.error('OAuth Token Error', error)
    if (res.aborted) return
    res.cork(() => {
      res.writeStatus('500 Internal Server Error')
      res.end(JSON.stringify({error: 'server_error'}))
    })
  }
}

export default tokenHandler
