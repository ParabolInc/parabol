import bcrypt from 'bcrypt'
import {AuthIdentityTypeEnum, Security} from 'parabol-client/types/constEnums'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import generateRandomString from '../../../generateRandomString'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import processEmailPasswordReset from '../../mutations/helpers/processEmailPasswordReset'
import {MutationResolvers} from '../../private/resolverTypes'

const removeAuthIdentity: MutationResolvers['removeAuthIdentity'] = async (
  _source,
  {domain, identityType, addLocal},
  {ip}
) => {
  // VALIDATION
  const normalizedDomain = domain.toLowerCase().trim()
  const users = await getUsersByDomain(normalizedDomain)
  if (!users.length) {
    return {error: {message: 'No user emails match that domain'}}
  }

  // RESOLUTION
  const usersWithUpdatedIdentitiesPromises = users.map(async (user) => {
    const {id: userId, identities} = user
    const filteredIdentities = identities.filter((identity) => identity.type !== identityType)
    const localIdentity = identities.find(
      (identity) => identity.type === AuthIdentityTypeEnum.LOCAL
    )
    if (!localIdentity && addLocal) {
      const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
      const dummyPassword = generateRandomString(Security.SALT_ROUNDS)
      const dummyHashedPassword = await bcrypt.hash(dummyPassword, Security.SALT_ROUNDS)
      const newIdentity = new AuthIdentityLocal({
        hashedPassword: dummyHashedPassword,
        id: identityId,
        isEmailVerified: false
      })
      const newIdentities = [...filteredIdentities, newIdentity]
      return {...user, identities: newIdentities}
    } else {
      return {...user, identities: filteredIdentities}
    }
  })
  const usersWithUpdatedIdentities = await Promise.all(usersWithUpdatedIdentitiesPromises)

  await Promise.all(
    usersWithUpdatedIdentities.map(({identities, id: userId, email}) =>
      processEmailPasswordReset(ip, email, identities, userId)
    )
  )

  const updatedUserIds = usersWithUpdatedIdentities.map(({id}) => id)
  const data = {userIds: updatedUserIds}
  return data
}

export default removeAuthIdentity
