import AuthToken from '../database/types/AuthToken'

export default class StatelessContext {
  ip: string
  authToken?: AuthToken | Record<string, unknown>
  constructor(ip: string, authToken: AuthToken | Record<string, unknown>) {
    this.ip = ip
    this.authToken = authToken
  }
}
