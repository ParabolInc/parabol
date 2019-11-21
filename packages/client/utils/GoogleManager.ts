export default class GoogleManager {
  static SCOPE = 'openid email profile'
  accessToken: string
  fetch: Window['fetch']

  constructor(accessToken: string, {fetch}) {
    this.fetch = fetch
    this.accessToken = accessToken
  }
}
