import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {SIGNIN_SLUG} from '../../client/utils/constants'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import getReqAuth from '../utils/getReqAuth'

import {Logger} from '../utils/Logger'
import {createOAuthCode} from './createOAuthCode'

const authorizeHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  let authToken = getReqAuth(req)

  if (!authToken?.sub) {
    const query = req.getQuery()
    const currentPath = `/oauth/authorize?${query}`
    const loginUrl = makeAppURL(appOrigin, `/${SIGNIN_SLUG}`, {
      searchParams: {redirectTo: currentPath}
    })
    res.writeStatus('302 Found')
    res.writeHeader('Location', loginUrl)
    res.end()
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

    const redirectUrl = new URL(redirectUri)
    redirectUrl.searchParams.set('code', result.code)
    if (state) {
      redirectUrl.searchParams.set('state', state)
    }

    res.writeStatus('302 Found')
    res.writeHeader('Location', redirectUrl.toString())
    res.end()
  } catch (error) {
    Logger.log('OAuth Authorization Error', error)
    const errorMessage = (error as Error).message
    if (
      errorMessage.includes('Invalid client_id') ||
      errorMessage.includes('Invalid redirect_uri') ||
      errorMessage.includes('Invalid scope')
    ) {
      res.writeStatus('400 Bad Request')
      res.end(errorMessage)
    } else {
      Logger.error('authorizeHandler error:', error)
      res.writeStatus('500 Internal Server Error')
      res.end('Internal Server Error')
    }
  }
})

export default authorizeHandler
