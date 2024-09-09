export default abstract class MicrosoftManager {
  abstract fetch: any
  static SCOPE = 'openid email profile'
  accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
}
