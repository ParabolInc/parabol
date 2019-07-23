import {fromEpochSeconds, toEpochSeconds} from 'server/utils/epochTime'
import {sign, verify} from 'jsonwebtoken'
import ms from 'ms'

// 'eyJhbGciOiJIUzI1NiJ9' is the result for the following line
const header = Buffer.from(JSON.stringify({alg: 'HS256'})).toString('base64')

const LIFESPAN = ms('1d')

export const signMassInviteToken = (teamId: string, userId: string) => {
  const exp = toEpochSeconds(Date.now() + LIFESPAN)
  const raw = [exp, teamId, userId].join('.')
  const fullToken = sign(raw, process.env.AUTH0_CLIENT_SECRET!)
  // remove the alg header
  return fullToken.slice(header.length + 1)
}

export const verifyMassInviteToken = (token: string) => {
  const fullToken = `${header}.${token}`
  let raw
  try {
    raw = verify(fullToken, process.env.AUTH0_CLIENT_SECRET!)
  } catch (e) {
    return {error: 'notFound' as 'notFound'}
  }
  const [exp, teamId, userId] = raw.split('.')
  const expDate = fromEpochSeconds(exp)
  if (expDate < new Date()) return {error: 'expired' as 'expired', teamId, userId}
  return {teamId, userId, exp: expDate}
}
