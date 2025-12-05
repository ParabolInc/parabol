import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import OAuthCode from '../database/types/OAuthAPICode'
import getKysely from '../postgres/getKysely'
import getReqAuth from '../utils/getReqAuth'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {Logger} from '../utils/Logger'

const authorizeHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  let authToken = getReqAuth(req)

  // 1. Validate User Session
  if (!authToken?.sub) {
    // Try to get token from cookie
    const cookieHeader = req.getHeader('cookie')
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce(
        (acc: Record<string, string>, cookie) => {
          const [key, value] = cookie.split('=').map((c) => c.trim())
          if (key && value) {
            acc[key] = value
          }
          return acc
        },
        {} as Record<string, string>
      )

      if (cookies.jwt) {
        authToken = getVerifiedAuthToken(cookies.jwt)
      }
    }
  }

  if (!authToken?.sub) {
    const loginUrl = makeAppURL(appOrigin, '/login')
    res.cork(() => {
      res.writeStatus('302 Found')
      res.writeHeader('Location', loginUrl)
      res.end()
    })
    return
  }

  // 2. Parse Query Parameters
  const query = req.getQuery()
  const params = new URLSearchParams(query)
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')
  const responseType = params.get('response_type')
  const scope = params.get('scope')
  const state = params.get('state')

  if (!clientId || !redirectUri || responseType !== 'code') {
    if (res.aborted) return
    res.cork(() => {
      res.writeStatus('400 Bad Request')
      res.end('Invalid request parameters')
    })
    return
  }

  try {
    // 3. Validate Client (Organization)
    const pg = getKysely()
    const provider = await pg
      .selectFrom('OAuthAPIProvider')
      .selectAll()
      .where('clientId', '=', clientId)
      .executeTakeFirst()

    if (!provider) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end('Invalid client_id')
      })
      return
    }

    if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
      if (res.aborted) return
      res.cork(() => {
        res.writeStatus('400 Bad Request')
        res.end('Invalid redirect_uri')
      })
      return
    }

    // 4. Generate Authorization Code
    const scopes = scope ? scope.split(' ') : []
    const code = new OAuthCode({
      clientId,
      redirectUri,
      userId: authToken.sub,
      scopes
    })

    await pg
      .insertInto('OAuthAPICode')
      .values({
        id: code.id,
        clientId: code.clientId,
        redirectUri: code.redirectUri,
        userId: code.userId,
        scopes: code.scopes,
        expiresAt: code.expiresAt.toISOString(),
        createdAt: code.createdAt.toISOString()
      })
      .execute()

    // 6. Redirect with Code
    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('code', code.id)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.cork(() => {
      res.writeStatus('302 Found')
      res.writeHeader('Location', redirectUrl.toString())
      res.end()
    })
  } catch (error) {
    Logger.error('OAuth Authorization Error', error)
    if (res.aborted) return
    res.cork(() => {
      res.writeStatus('500 Internal Server Error')
      res.end('Internal Server Error')
    })
  }
}

export default authorizeHandler
