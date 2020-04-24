export default abstract class GoogleManager {
  abstract fetch: any
  static SCOPE = 'openid email profile'
  accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
}
