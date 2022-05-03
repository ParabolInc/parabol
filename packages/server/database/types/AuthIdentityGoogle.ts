import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentity from './AuthIdentity'

interface Input {
  isEmailVerified?: boolean
  id: string
}

export default class AuthIdentityGoogle extends AuthIdentity {
  type!: 'GOOGLE'
  constructor(input: Input) {
    super({...input, type: AuthIdentityTypeEnum.GOOGLE})
  }
}
