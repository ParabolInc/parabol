import {fetch} from '@whatwg-node/fetch'
import {decode} from 'jsonwebtoken'
import MicrosoftManager from 'parabol-client/utils/MicrosoftManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {stringify} from 'querystring'
import appOrigin from '../appOrigin'
import sendToSentry from './sendToSentry'

interface OAuth2Response {
  access_token: string
  id_token: string
  expires_in: number
  token_type: string
  refresh_token?: string
}

export interface MicrosoftIDToken {
  aud: string
  iss: string
  iat: number
  nbf: number
  exp: number
  email: string
  name: string
  oid: string
  preferred_username: string
  rh: string
  sub: string
  tid: string
  uti: string
  ver: string
}

export default class MicrosoftServerManager extends MicrosoftManager {
  fetch = fetch
  static async init(code: string) {
    return MicrosoftServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.MICROSOFT_CLIENT_ID,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: makeAppURL(appOrigin, 'auth/microsoft')
    }

    const uri = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: stringify(queryParams)
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    if ('error' in tokenJson) {
      const errorMessage = (tokenJson.error as string) || `Received null OAuth2 Error from ${uri}`
      sendToSentry(new Error(errorMessage))
    }
    const {access_token: accessToken, id_token: idToken} = tokenJson
    const id = decode(idToken) as MicrosoftIDToken
    return new MicrosoftServerManager(accessToken, id)
  }

  id?: MicrosoftIDToken
  constructor(accessToken: string, id?: MicrosoftIDToken) {
    super(accessToken)
    this.id = id
  }
}
