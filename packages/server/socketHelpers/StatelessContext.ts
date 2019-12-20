import AuthToken from '../database/types/AuthToken'

export default class StatelessContext {
  ip: string
  authToken?: AuthToken | {}
  constructor(ip: string, authToken: AuthToken | {}) {
    this.ip = ip
    this.authToken = authToken
  }
}
