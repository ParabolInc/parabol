import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {SIGNIN_SLUG} from '../../client/utils/constants'
import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import getRateLimiter from '../graphql/getRateLimiter'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import getReqAuth from '../utils/getReqAuth'
import {validateOAuthAuthorizationRequest} from './validateOAuthAuthorizationRequest'

const MAX_REQUESTS_PER_MINUTE = 30
const MAX_REQUESTS_PER_HOUR = 300

const authorizeHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const authToken = getReqAuth(req)
  const query = req.getQuery()

  if (!authToken?.sub) {
    const currentPath = `/oauth/authorize?${query}`
    const loginUrl = makeAppURL(appOrigin, `/${SIGNIN_SLUG}`, {
      searchParams: {redirectTo: currentPath}
    })
    res.writeStatus('302 Found')
    res.writeHeader('Location', loginUrl)
    res.end()
    return
  }

  const {lastMinute, lastHour = 0} = getRateLimiter().log(authToken.sub, 'oauthAuthorize', true)
  if (lastMinute > MAX_REQUESTS_PER_MINUTE || lastHour > MAX_REQUESTS_PER_HOUR) {
    res.writeStatus('429 Too Many Requests')
    res.writeHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Too many authorization requests. Try again later')
    return
  }

  const params = new URLSearchParams(query)
  const clientId = params.get('client_id')
  const redirectUri = params.get('redirect_uri')
  const state = params.get('state')

  const rejectRequest = (message: string) => {
    res.writeStatus('400 Bad Request')
    res.writeHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(message)
  }

  if (!clientId || !redirectUri || !state || params.get('response_type') !== 'code') {
    rejectRequest('Invalid request parameters')
    return
  }

  const dataLoader = getNewDataLoader('authorizeHandler')
  const authorization = await validateOAuthAuthorizationRequest(
    {
      clientId,
      redirectUri,
      scope: params.get('scope'),
      state,
      codeChallenge: params.get('code_challenge'),
      codeChallengeMethod: params.get('code_challenge_method'),
      resource: params.get('resource')
    },
    authToken.sub,
    dataLoader
  )
  dataLoader.dispose()
  if ('error' in authorization) {
    rejectRequest(authorization.error)
    return
  }

  res.writeStatus('302 Found')
  res.writeHeader('Location', `${makeAppURL(appOrigin, '/authorize-app')}?${query}`)
  res.end()
})

export default authorizeHandler
