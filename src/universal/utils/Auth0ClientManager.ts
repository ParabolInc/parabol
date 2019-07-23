import makeHref from 'universal/utils/makeHref'
import getOAuthPopupFeatures from 'universal/utils/getOAuthPopupFeatures'

interface SignupResponse {
  email: string
  email_verified: boolean
  _id: string // doesn't include connection prefix!
}

interface ErrorResponse {
  error: string
  error_description: string
}

interface SignupErrorResponse {
  code: string
  description: string
  name: string
  statusCode: number
}

interface LoginResponse {
  co_id: string
  co_verifier: string
  login_ticket: string
}

export default class Auth0ClientManager {
  static CONNECTION = 'Username-Password-Authentication'
  static SCOPE = 'openid rol tms bet'
  domain: string
  clientId: string
  fetch: typeof fetch

  constructor (
    domain: string = window.__ACTION__.auth0Domain,
    clientId: string = window.__ACTION__.auth0
  ) {
    this.domain = domain
    this.clientId = clientId
    this.fetch = window.fetch.bind(window)
  }

  async post<T> (url: string, payload: object, initOptions: RequestInit = {}, ignoreResult?: boolean): Promise<T> {
    const res = await this.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      ...initOptions,
      body: JSON.stringify(payload)
    })
    return ignoreResult ? undefined : res.json()
  }

  signup (email: string, password: string) {
    return this.post<SignupResponse | SignupErrorResponse>(
      `https://${this.domain}/dbconnections/signup`,
      {
        client_id: this.clientId,
        email,
        password,
        connection: Auth0ClientManager.CONNECTION
      }
    )
  }

  async login (email: string, password: string) {
    const res = await this.post<LoginResponse | ErrorResponse>(
      `https://${this.domain}/co/authenticate`,
      {
        client_id: this.clientId,
        credential_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password,
        realm: Auth0ClientManager.CONNECTION
      },
      {
        // hugely important! without credentials, the login_ticket will be invalid
        credentials: 'include'
      }
    )
    if ('login_ticket' in res) {
      const {login_ticket} = res
      const state = Math.random()
        .toString(36)
        .substring(5)
      window.localStorage.setItem('auth0State', state)
      const params = new URLSearchParams({
        client_id: this.clientId,
        scope: Auth0ClientManager.SCOPE,
        realm: Auth0ClientManager.CONNECTION,
        redirect_uri: makeHref(`/oauth-redirect${window.location.search}`),
        response_type: 'token',
        state,
        login_ticket
      }).toString()
      window.location.href = `https://${this.domain}/authorize?${params}`
      return
    }
    return res
  }

  async loginWithGoogle (email?: string): Promise<{idToken: string} | null> {
    const state = Math.random()
      .toString(36)
      .substring(5)
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: Auth0ClientManager.SCOPE,
      connection: 'google-oauth2',
      redirect_uri: makeHref(`/oauth-redirect${window.location.search}`),
      response_type: 'token',
      state,
      prompt: 'select_account'
    })
    if (email) {
      params.append('login_hint', email)
    }
    const authUrl = `https://${this.domain}/authorize?${params.toString()}`
    const popup = window.open(
      authUrl,
      'OAuth',
      getOAuthPopupFeatures({width: 385, height: 550, top: 64})
    )
    let closeCheckerId
    return new Promise((resolve, reject) => {
      const handler = (event) => {
        // an extension posted to the opener
        if (typeof event.data !== 'object' || event.data.state !== state) return
        const {code} = event.data
        window.clearInterval(closeCheckerId)
        if (event.origin !== window.location.origin || typeof code !== 'string') {
          reject(`Bad response: ${event.data}, ${event.origin}`)
          return
        }

        popup && popup.close()
        window.removeEventListener('message', handler)
        resolve({idToken: code})
      }

      closeCheckerId = window.setInterval(() => {
        if (popup && popup.closed) {
          resolve(null)
          window.clearInterval(closeCheckerId)
          window.removeEventListener('message', handler)
        }
      }, 100)
      window.addEventListener('message', handler)
    })
  }

  changePassword (email: string) {
    return this.post<string>(`https://${this.domain}/dbconnections/change_password`, {
      client_id: this.clientId,
      email,
      connection: Auth0ClientManager.CONNECTION
    }, undefined, true)
  }
}
