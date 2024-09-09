import {AuthIdentityTypeEnum} from '../../../client/types/constEnums'
import AuthIdentity from './AuthIdentity'

interface Input {
  isEmailVerified?: boolean
  id: string
  // Tenant id
  tid: string
}

export default class AuthIdentityMicrosoft extends AuthIdentity {
  type!: 'MICROSOFT'
  // Tenant id. This is the id of the organization in Microsoft that the user belongs to
  tid: string
  constructor(input: Input) {
    super({...input, type: AuthIdentityTypeEnum.MICROSOFT})
    this.tid = input.tid
  }
}
