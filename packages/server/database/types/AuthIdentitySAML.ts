import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentity from './AuthIdentity'

interface Input {
  isEmailVerified?: boolean
  id: string
}

export default class AuthIdentitySAML extends AuthIdentity {
  type!: 'SAML'
  constructor(input: Input) {
    super({...input, type: AuthIdentityTypeEnum.SAML})
  }
}
