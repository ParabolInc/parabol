import AuthIdentity from './AuthIdentity'
import {AuthIdentityTypeEnum} from 'parabol-client/lib/types/graphql'

interface Input {
  id: string
  hashedPassword: string
  isEmailVerified?: boolean
}

export default class AuthIdentityLocal extends AuthIdentity {
  hashedPassword: string
  constructor(input: Input) {
    const {id, hashedPassword, isEmailVerified} = input
    super({id, isEmailVerified, type: AuthIdentityTypeEnum.LOCAL})
    this.hashedPassword = hashedPassword
  }
}
