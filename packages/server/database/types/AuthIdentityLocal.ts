import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentity from './AuthIdentity'

interface Input {
  id: string
  hashedPassword: string
  isEmailVerified?: boolean
}

export default class AuthIdentityLocal extends AuthIdentity {
  type!: 'LOCAL'
  hashedPassword: string
  constructor(input: Input) {
    const {id, hashedPassword, isEmailVerified} = input
    super({id, isEmailVerified, type: AuthIdentityTypeEnum.LOCAL})
    this.hashedPassword = hashedPassword
  }
}
