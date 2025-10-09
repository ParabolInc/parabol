import {CookieListItem, CookieStore, getCookieString} from '@whatwg-node/cookie-store'
import {Threshold} from 'parabol-client/types/constEnums'
import AuthToken from '../database/types/AuthToken'
import {GQLContext} from '../graphql/graphql'
import {sign} from 'jsonwebtoken'
import encodeAuthToken from './encodeAuthToken'
// for the cookieStore declaration
import '@whatwg-node/server-plugin-cookies'

/**
 * We use one secure httpOnly cookie which is signed and used for authentication
 * A second one is client readable and just used for the client to determine the auth state
 */
const serverCookie = '__Host-Http-authToken'
const clientCookie = 'authToken'

const encodeClientAuthToken = (authToken: AuthToken) => {
  const noSecret = ''
  return sign(JSON.parse(JSON.stringify(authToken)), noSecret, {algorithm: 'none'})
}

const createCookies = (token: AuthToken | null, expires: number) => {
  const serverValue = token ? encodeAuthToken(token) : ''
  const clientValue = token ? encodeClientAuthToken(token) : ''

  return [{
    name: serverCookie,
    value: serverValue,
    expires,
    domain: null,
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: true
  }, {
    name: clientCookie,
    value: clientValue,
    expires,
    domain: null,
    path: '/',
  }] as CookieListItem[]
}

export const setAuthCookie = (
  context: GQLContext,
  authToken: AuthToken,
  lifespan: number = Threshold.JWT_LIFESPAN
) => {
  const cookies = createCookies(authToken, Date.now() + lifespan)
  cookies.forEach((cookie) => {
    context.request.cookieStore?.set(cookie)
  })
}

export const createCookieHeader = (
  authToken: AuthToken,
  lifespan: number = Threshold.JWT_LIFESPAN
) => {
  const cookies = createCookies(authToken, Date.now() + lifespan)
  return cookies.map(getCookieString).join(', ')
}

export const unsetAuthCookie = (context: GQLContext) => {
  const cookies = createCookies(null, Date.now())
  cookies.forEach((cookie) => {
    context.request.cookieStore?.set(cookie)
  })
}

export const getAuthTokenFromCookie = async (
  cookieHeader: string | null | undefined
): Promise<string | null> => {
  const cookieStore = new CookieStore(cookieHeader || '')
  const cookie = await cookieStore.get(serverCookie)
  return cookie?.value ?? null
}
