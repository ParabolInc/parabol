import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {Kysely} from 'kysely'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import OAuthCode from '../database/types/OAuthAPICode'
import getKysely from '../postgres/getKysely'
import getReqAuth from '../utils/getReqAuth'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {Logger} from '../utils/Logger'
import {DB} from './dbTypes'

const authorizeHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  let authToken = getReqAuth(req)
  console.log('Initial authToken:', authToken)

  // 1. Validate User Session
  if (!authToken?.sub) {
    // Try to get token from cookie
    const cookieHeader = req.getHeader('cookie')
    console.log('Cookie Header:', cookieHeader)
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
      console.log('Parsed Cookies Keys:', Object.keys(cookies))

      if (cookies.jwt) {
        authToken = getVerifiedAuthToken(cookies.jwt)
        console.log('AuthToken from cookie:', authToken)
      }
    }
  }

  if (!authToken?.sub) {
    const loginUrl = makeAppURL(appOrigin, '/login')
    console.log('Redirecting to login:', loginUrl)
    res.writeStatus('302 Found')
    res.writeHeader('Location', loginUrl)
    res.end()
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
    res.writeStatus('400 Bad Request')
    res.end('Invalid request parameters')
    return
  }

  try {
    // 3. Validate Client (Organization)
    const db = getKysely() as unknown as Kysely<DB>
    const provider = await db
      .selectFrom('OAuthAPIProvider')
      .selectAll()
      .where('clientId', '=', clientId)
      .executeTakeFirst()

    if (!provider) {
      res.writeStatus('400 Bad Request')
      res.end('Invalid client_id')
      return
    }

    if (!provider.redirectUris || !provider.redirectUris.includes(redirectUri)) {
      res.writeStatus('400 Bad Request').end('Invalid redirect_uri')
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

    await db.insertInto('OAuthAPICode').values(code).execute()

    // 6. Redirect with Code
    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('code', code.id)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.writeStatus('302 Found')
    res.writeHeader('Location', redirectUrl.toString())
    res.end()
  } catch (error) {
    Logger.error('OAuth Authorization Error', error)
    res.writeStatus('500 Internal Server Error')
    res.end('Internal Server Error')
  }
}

export default authorizeHandler
