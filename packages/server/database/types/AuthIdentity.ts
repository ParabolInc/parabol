import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'

interface Input {
  id: string
  isEmailVerified?: boolean
  type: AuthIdentityTypeEnum
}

export default abstract class AuthIdentity {
  isEmailVerified: boolean
  type: AuthIdentityTypeEnum
  id: string
  constructor(input: Input) {
    const {id, isEmailVerified, type} = input
    this.isEmailVerified = isEmailVerified ?? false
    this.type = type
    this.id = id
  }
}
