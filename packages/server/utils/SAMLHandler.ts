import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import {createCookieHeaders} from './authCookie'
import {callGQL} from './callGQL'
import getVerifiedAuthToken from './getVerifiedAuthToken'
import isExpectedError from './isExpectedError'

const query = `
mutation LoginSAML($queryString: String!, $samlName: ID!) {
  loginSAML(queryString: $queryString, samlName: $samlName) {
    userId
    authToken
    isNewUser
    user {
      isPatient0
    }
  }
}
`

type TData = {
  loginSAML: {
    userId: string
    authToken: string
    isNewUser: boolean
    user: {
      isPatient0: boolean
    }
  }
}
const redirectOnError = (res: HttpResponse, error: string) => {
  res.writeStatus('302').writeHeader('location', `/saml-redirect?error=${error}`).end()
}

const GENERIC_ERROR = 'Error signing in|Please try again'

const SAMLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const samlName = req.getParameter(0)
  if (!samlName) {
    redirectOnError(res, 'Invalid redirect URL!|Did you set up the service provider correctly?')
    return
  }
  const parser = (buffer: Buffer) => buffer.toString()
  const queryString = await parseBody({res, parser})
  const payload = await callGQL<TData>(query, {queryString, samlName})
  if (!payload) return
  const {data, errors} = payload
  const [firstError] = errors ?? []
  if (firstError) {
    redirectOnError(res, isExpectedError(firstError) ? firstError.message : GENERIC_ERROR)
    return
  }
  if (!data) {
    redirectOnError(res, GENERIC_ERROR)
    return
  }
  const {loginSAML} = data
  const {userId, authToken, isNewUser, user} = loginSAML
  const authObj = getVerifiedAuthToken(authToken)
  if (!authToken || !authObj) {
    redirectOnError(res, GENERIC_ERROR)
    return
  }

  const cookieHeaders = createCookieHeaders(authObj)
  res.writeStatus('302')
  cookieHeaders.forEach((header) => {
    res.writeHeader('set-cookie', header)
  })
  res
    .writeHeader(
      'location',
      `/saml-redirect?userId=${userId}&isNewUser=${isNewUser}&isPatient0=${user.isPatient0}`
    )
    .end()
})

export default SAMLHandler
