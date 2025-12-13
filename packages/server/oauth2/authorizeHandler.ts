import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import getReqAuth from '../utils/getReqAuth'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {Logger} from '../utils/Logger'
import {createOAuthCode} from './createOAuthCode'

const authorizeHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  let authToken = getReqAuth(req)

  if (!authToken?.sub) {
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
    const scopes = scope ? scope.split(' ') : []

    const result = await createOAuthCode({
      clientId,
      redirectUri,
      scopes,
      userId: authToken.sub
    })

    const redirectUrl = new URL(result.redirectUri)
    redirectUrl.searchParams.set('code', result.code)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.writeStatus('302 Found')
    res.writeHeader('Location', redirectUrl.toString())
    res.end()
  } catch (error) {
    Logger.error('OAuth Authorization Error', error)
    const errorMessage = (error as Error).message
    if (
      errorMessage.includes('Invalid client_id') ||
      errorMessage.includes('Invalid redirect_uri')
    ) {
      res.writeStatus('400 Bad Request')
      res.end(errorMessage)
    } else {
      res.writeStatus('500 Internal Server Error')
      res.end('Internal Server Error')
    }
  }
})

export default authorizeHandler
