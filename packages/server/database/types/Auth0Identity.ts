interface Input {
  connection: string
  userId: string
  provider: string
  isSocial: boolean
}

export default class Auth0Identity {
  connection: string
  userId: string
  provider: string
  isSocial: boolean
  constructor(input: Input) {
    const {connection, isSocial, provider, userId} = input
    this.connection = connection
    this.isSocial = isSocial
    this.provider = provider
    this.userId = userId
  }
}
