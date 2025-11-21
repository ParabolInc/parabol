import {CookieListItem, getCookieString, parse} from '@whatwg-node/cookie-store'
import AuthToken from '../database/types/AuthToken'
import {GQLContext} from '../graphql/graphql'
import encodeAuthToken, {encodeUnsignedAuthToken} from './encodeAuthToken'
// for the cookieStore declaration
import '@whatwg-node/server-plugin-cookies'
import {Logger} from './Logger'

/**
 * We use one secure httpOnly cookie which is signed and used for authentication
 * A second one is client readable and just used for the client to determine the auth state
 */
const serverCookie = '__Host-Http-authToken'
const clientCookie = 'authToken'

const createCookies = (token: AuthToken | null) => {
  const serverValue = token ? encodeAuthToken(token) : ''
  const clientValue = token ? encodeUnsignedAuthToken(token) : ''
  const expires = token ? token.exp * 1000 : Date.now()

  return [
    {
      name: serverCookie,
      value: serverValue,
      expires,
      domain: null,
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true
    },
    {
      name: clientCookie,
      value: clientValue,
      expires,
      domain: null,
      path: '/'
    }
  ] as CookieListItem[]
}

export const setAuthCookie = (context: GQLContext, authToken: AuthToken) => {
  if (!context.request) {
    Logger.warn('No request object on context, cannot set auth cookie')
    return
  }
  const cookies = createCookies(authToken)
  cookies.forEach((cookie) => {
    context.request.cookieStore?.set(cookie)
  })
}

export const createCookieHeaders = (authToken: AuthToken) => {
  const cookies = createCookies(authToken)
  return cookies.map(getCookieString)
}

export const unsetAuthCookie = (context: GQLContext) => {
  if (!context.request) {
    Logger.warn('No request object on context, cannot unset auth cookie')
    return
  }
  const cookies = createCookies(null)
  cookies.forEach((cookie) => {
    context.request.cookieStore?.set(cookie)
  })
}

export const getAuthTokenFromCookie = (cookieHeader: string | null | undefined): string | null => {
  const cookies = parse(cookieHeader || '')
  const cookieToken = cookies.get(serverCookie)?.value ?? null
  return cookieToken
}
