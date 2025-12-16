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
  scp?: string[]
  aud?: string
}

export default class AuthToken {
  sub: string
  tms: string[]
  rol: 'su' | 'impersonate' | null
  bet?: 1
  scp?: string[]
  iat: number
  iss: string
  exp: number
  aud: string
  constructor(input: Input) {
    const {bet, rol, sub, tms, lifespan_ms, scp, aud} = input
    const now = new Date()
    this.sub = sub
    this.tms = tms
    this.iat = toEpochSeconds(now)
    this.aud = aud ?? 'action'
    this.iss = makeAppURL(appOrigin, '/')
    this.exp = toEpochSeconds(now.getTime() + (lifespan_ms ?? Threshold.JWT_LIFESPAN))
    this.rol = rol ?? null
    this.scp = scp

    if (bet) {
      this.bet = bet
    }
  }
}
