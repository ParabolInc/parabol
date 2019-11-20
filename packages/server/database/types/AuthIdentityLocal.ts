import AuthIdentity from './AuthIdentity'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'

interface Input {
  id: string
  hashedPassword: string
  isEmailVerified?: boolean
  verifiedEmailToken?: string
  verifiedEmailTokenExpiration?: Date
  resetPasswordToken?: string
  resetPasswordTokenExpiration?: Date
}

export default class AuthIdentityLocal extends AuthIdentity {
  hashedPassword: string
  verifiedEmailToken: string | null
  verifiedEmailTokenExpiration: Date | null
  resetPasswordToken: string | null
  resetPasswordTokenExpiration: Date | null
  constructor(input: Input) {
    const {
      id,
      hashedPassword,
      isEmailVerified,
      resetPasswordToken,
      resetPasswordTokenExpiration,
      verifiedEmailToken,
      verifiedEmailTokenExpiration
    } = input
    super({id, isEmailVerified, type: AuthIdentityTypeEnum.LOCAL})
    this.hashedPassword = hashedPassword
    this.resetPasswordToken = resetPasswordToken ?? null
    this.resetPasswordTokenExpiration = resetPasswordTokenExpiration ?? null
    this.verifiedEmailToken = verifiedEmailToken ?? null
    this.verifiedEmailTokenExpiration = verifiedEmailTokenExpiration ?? null
  }
}
