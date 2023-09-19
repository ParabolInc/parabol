import AuthToken from './AuthToken'

export default class ServerAuthToken extends AuthToken {
  constructor() {
    super({sub: 'aGhostUser', tms: [], rol: 'su'})
  }
}
