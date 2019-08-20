import makeAppLink from '../../utils/makeAppLink'
import {toEpochSeconds} from '../../utils/epochTime'
import {Threshold} from 'parabol-client/types/constEnums'

interface Input {
  sub: string
  tms: string[]
  rol?: 'su'
  bet?: 1
  iat?: number
  iss?: string
  exp?: number
  aud?: string
}

export default class AuthToken {
  sub: string
  tms: string[]
  rol?: 'su'
  bet?: 1
  iat: number
  iss: string
  exp: number
  aud: string
  constructor(input: Input) {
    const {bet, rol, sub, tms, iat, iss, exp, aud} = input
    const now = new Date()
    this.sub = sub
    this.tms = tms
    this.iat = iat || toEpochSeconds(now)
    this.aud = aud || process.env.AUTH0_CLIENT_ID as string
    this.iss = iss || makeAppLink()
    this.exp = exp || toEpochSeconds(now.getTime() + Threshold.JWT_LIFESPAN)
    if (bet) {
      this.bet = bet
    }
    if (rol) {
      this.rol = rol
    }
  }
}

