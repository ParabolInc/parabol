import {Threshold} from 'parabol-client/types/constEnums'

interface Input {
  token: string
  email: string
  expiration?: Date
  hashedPassword?: string
  pseudoId?: string | null
  invitationToken?: string | null
}

export default class EmailVerification {
  invitationToken?: string
  token: string
  email: string
  expiration: Date
  hashedPassword?: string
  pseudoId?: string
  constructor(input: Input) {
    const {invitationToken, token, email, expiration, hashedPassword, pseudoId} = input
    this.invitationToken = invitationToken || undefined
    this.token = token
    this.email = email
    this.expiration = expiration || new Date(Date.now() + Threshold.EMAIL_VERIFICATION_LIFESPAN)
    this.hashedPassword = hashedPassword
    this.pseudoId = pseudoId || undefined
  }
}
