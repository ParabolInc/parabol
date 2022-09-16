import AuthToken from './AuthToken'

export default class ServerAuthToken extends AuthToken {
  constructor() {
    super({sub: 'parabol-server', tms: [], rol: 'su'})
  }
}
