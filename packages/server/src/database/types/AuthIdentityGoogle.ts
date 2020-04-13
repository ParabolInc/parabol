import AuthIdentity from './AuthIdentity'
import {AuthIdentityTypeEnum} from 'parabol-client/lib/types/graphql'

interface Input {
  isEmailVerified?: boolean
  id: string
}

export default class AuthIdentityGoogle extends AuthIdentity {
  constructor(input: Input) {
    super({...input, type: AuthIdentityTypeEnum.GOOGLE})
  }
}
