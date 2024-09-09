import bcrypt from 'bcryptjs'
import {sql} from 'kysely'
import ms from 'ms'
import {AuthenticationError, Threshold} from 'parabol-client/types/constEnums'
import sleep from 'parabol-client/utils/sleep'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import AuthToken from '../../../database/types/AuthToken'
import FailedAuthRequest from '../../../database/types/FailedAuthRequest'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'

const logFailedLogin = async (ip: string, email: string) => {
  const pg = getKysely()
  if (ip) {
    const failedAuthRequest = new FailedAuthRequest({ip, email})
    await pg.insertInto('FailedAuthRequest').values(failedAuthRequest).execute()
  }
}

const attemptLogin = async (denormEmail: string, password: string, ip = '') => {
  const pg = getKysely()
  const yesterday = new Date(Date.now() - ms('1d'))
  const email = denormEmail.toLowerCase().trim()

  const existingUser = await getUserByEmail(email)
  const {failOnAccount, failOnTime} = (await pg
    .with('byAccount', (qb) =>
      qb
        .selectFrom('FailedAuthRequest')
        .select((eb) => eb.fn.count<number>('id').as('attempts'))
        .where('ip', '=', ip)
        .where('email', '=', email)
        .where('time', '>=', yesterday)
    )
    .with('byTime', (qb) =>
      qb
        .selectFrom('FailedAuthRequest')
        .select((eb) => eb.fn.count<number>('id').as('attempts'))
        .where('ip', '=', ip)
        .where('time', '>=', yesterday)
    )
    .selectFrom(['byAccount', 'byTime'])
    .select(({ref}) => [
      sql<boolean>`${ref('byAccount.attempts')} >= ${Threshold.MAX_ACCOUNT_PASSWORD_ATTEMPTS}`.as(
        'failOnAccount'
      ),
      sql<boolean>`${ref('byTime.attempts')} >= ${Threshold.MAX_DAILY_PASSWORD_ATTEMPTS}`.as(
        'failOnTime'
      )
    ])
    .executeTakeFirst()) as {failOnAccount: boolean; failOnTime: boolean}

  if (failOnAccount || failOnTime) {
    await sleep(1000)
    // silently fail to trick security researchers
    return {error: AuthenticationError.INVALID_PASSWORD}
  }

  if (!existingUser) {
    await logFailedLogin(ip, email)
    return {error: AuthenticationError.USER_NOT_FOUND}
  }

  const {id: viewerId, identities, rol} = existingUser
  const localIdentity = identities.find(
    (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
  ) as AuthIdentityLocal
  if (!localIdentity) {
    const [bestIdentity] = identities
    if (!bestIdentity) {
      return {error: AuthenticationError.IDENTITY_NOT_FOUND}
    }
    const {type} = bestIdentity
    if (type === AuthIdentityTypeEnum.GOOGLE) return {error: AuthenticationError.USER_EXISTS_GOOGLE}
    if (type === AuthIdentityTypeEnum.MICROSOFT)
      return {error: AuthenticationError.USER_EXISTS_MICROSOFT}
    throw new Error(`Unknown identity type: ${type}`)
  }
  const {hashedPassword} = localIdentity
  if (!hashedPassword) {
    return {error: AuthenticationError.MISSING_HASH}
  }
  // check password
  const isCorrectPassword = await bcrypt.compare(password, hashedPassword)
  if (isCorrectPassword) {
    return {
      userId: viewerId,
      // create a brand new auth token using the tms in our DB
      authToken: new AuthToken({sub: viewerId, rol, tms: existingUser.tms})
    }
  }
  await logFailedLogin(ip, email)
  return {error: AuthenticationError.INVALID_PASSWORD}
}

export default attemptLogin
