import {fromEpochSeconds, toEpochSeconds} from './epochTime'
import {sign, verify} from 'jsonwebtoken'
import ms from 'ms'
import {InvitationTokenError} from 'parabol-client/types/constEnums'

// 'eyJhbGciOiJIUzI1NiJ9' is the result for the following line
const header = Buffer.from(JSON.stringify({alg: 'HS256'})).toString('base64')

const LIFESPAN = ms('1d')
const SERVER_SECRET = process.env.AUTH0_CLIENT_SECRET!

export const signMassInviteToken = (teamId: string, userId: string) => {
  const exp = toEpochSeconds(Date.now() + LIFESPAN)
  const raw = [exp, teamId, userId].join('.')
  const fullToken = sign(raw, SERVER_SECRET)
  // remove the alg header
  return fullToken.slice(header.length + 1)
}

export const verifyMassInviteToken = (token: string) => {
  const fullToken = `${header}.${token}`
  let raw: string
  try {
    raw = verify(fullToken, SERVER_SECRET) as string
  } catch (e) {
    return {error: InvitationTokenError.NOT_FOUND}
  }
  const [exp, teamId, userId] = raw.split('.')
  const expDate = fromEpochSeconds(exp)
  if (expDate < new Date()) return {error: InvitationTokenError.EXPIRED, teamId, userId}
  return {teamId, userId, exp: expDate}
}
