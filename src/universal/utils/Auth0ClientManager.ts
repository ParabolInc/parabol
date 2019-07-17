import makeHref from 'universal/utils/makeHref'

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

  async post<T> (url: string, payload: object): Promise<T> {
    const res = await this.fetch(url, {
      method: 'POST',
      // hugely important! without credentials, the login_ticket will be invalid
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    return res.json()
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
}
