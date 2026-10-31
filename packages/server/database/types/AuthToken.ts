import {randomUUID} from 'crypto'
import {Threshold} from 'parabol-client/types/constEnums'
import makeAppURL from '../../../client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import {toEpochSeconds} from '../../utils/epochTime'

interface Input {
  sub: string
  tms: string[]
  rol?: 'su' | 'impersonate' | null
  bet?: 1
  lifespan_ms?: number
  exp?: number
  scope?: string[]
  aud?: string
  jti?: string
}

export default class AuthToken {
  sub: string
  tms: string[]
  rol: 'su' | 'impersonate' | null
  bet?: 1
  scope?: string[]
  iat: number
  iss: string
  exp: number
  aud: string
  jti: string
  constructor(input: Input) {
    const {bet, rol, sub, tms, lifespan_ms, exp, scope, aud, jti} = input
    const now = new Date()
    this.sub = sub
    this.tms = tms
    this.iat = toEpochSeconds(now)
    this.aud = aud ?? 'action'
    this.iss = makeAppURL(appOrigin, '/')
    const lifespanExp = toEpochSeconds(now.getTime() + (lifespan_ms ?? Threshold.JWT_LIFESPAN))
    // re-issuing a token refreshes the session, but an impersonation can't outlive its first token
    this.exp = rol === 'impersonate' && exp ? Math.min(exp, lifespanExp) : lifespanExp
    this.rol = rol ?? null
    this.scope = scope
    this.jti = jti ?? randomUUID()

    if (bet) {
      this.bet = bet
    }
  }
}
