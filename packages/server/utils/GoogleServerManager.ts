import {fetch} from '@whatwg-node/fetch'
import {gaxios, OAuth2Client, type TokenPayload} from 'google-auth-library'
import GoogleManager from 'parabol-client/utils/GoogleManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import type {OAuth2Error} from '../types/custom'
import {OAuth2TokenError} from './OAuth2TokenError'

export type {TokenPayload as GoogleIDToken}

export default class GoogleServerManager extends GoogleManager {
  fetch = fetch
  static async init(code: string) {
    return GoogleServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const client = new OAuth2Client({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: makeAppURL(appOrigin, 'auth/google')
    })
    const {tokens} = await client.getToken(code).catch((error: unknown) => {
      const body: Partial<OAuth2Error> | undefined =
        error instanceof gaxios.GaxiosError ? error.response?.data : undefined
      if (typeof body?.error !== 'string') throw error
      throw new OAuth2TokenError(body.error_description || body.error, body.error)
    })
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID
    })
    const id = ticket.getPayload()
    return new GoogleServerManager(tokens.access_token!, id)
  }

  id?: TokenPayload
  constructor(accessToken: string, id?: TokenPayload) {
    super(accessToken)
    this.id = id
  }
}
