import User from '../../../database/types/User'
import {AuthIdentityTypeEnum} from 'parabol-client/types/graphql'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import {AuthenticationError} from 'parabol-client/types/constEnums'
import {sendSegmentIdentify} from '../../../utils/sendSegmentEvent'
import encodeAuthToken from '../../../utils/encodeAuthToken'
import AuthToken from '../../../database/types/AuthToken'
import getRethink from '../../../database/rethinkDriver'
import bcrypt from 'bcrypt'

const attemptLogin = async (email: string, password: string) => {
  const r = await getRethink()
  const existingUser = (await r
    .table<User>('User')
    .getAll(email, {index: 'email'})
    .nth(0)
    .default(null)
    .run()) as User | null
  if (!existingUser) return {error: AuthenticationError.USER_NOT_FOUND}

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
    throw new Error(`Unknown identity type: ${type}`)
  }
  const {hashedPassword} = localIdentity
  // check password
  const isCorrectPassword = await bcrypt.compare(password, hashedPassword)
  if (isCorrectPassword) {
    // log them in
    sendSegmentIdentify(viewerId).catch()
    return {
      userId: viewerId,
      // create a brand new auth token using the tms in our DB, not auth0s
      authToken: encodeAuthToken(new AuthToken({sub: viewerId, rol, tms: existingUser.tms}))
    }
  }
  return {error: AuthenticationError.INVALID_PASSWORD}
}

export default attemptLogin
