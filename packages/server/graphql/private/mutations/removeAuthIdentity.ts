import bcrypt from 'bcrypt'
import {AuthIdentityTypeEnum, Security} from 'parabol-client/types/constEnums'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import updateUser from '../../../postgres/queries/updateUser'
import {getUserId} from '../../../utils/authorization'
import {MutationResolvers} from '../../public/resolverTypes'

const removeAuthIdentity: MutationResolvers['removeAuthIdentity'] = async (
  _source,
  {domain, identityType, addLocal},
  {authToken}
) => {
  const viewerId = getUserId(authToken)
  const now = new Date()

  // VALIDATION

  // RESOLUTION
  const users = await getUsersByDomain(domain)
  const dummyPassword = 'dummy'
  const dummyHashedPassword = await bcrypt.hash(dummyPassword, Security.SALT_ROUNDS)
  const updateUsersPromises = users.map((user) => {
    const {id: userId, identities} = user
    const filteredIdentities = identities.filter((identity) => identity.type !== identityType)
    if (!filteredIdentities.length || addLocal) {
      const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
      const newIdentity = new AuthIdentityLocal({
        hashedPassword: dummyHashedPassword,
        id: identityId,
        isEmailVerified: false
      })
      const newIdentities = [...filteredIdentities, newIdentity]
      return updateUser({identities: newIdentities}, userId)
    } else {
      return updateUser({identities: filteredIdentities}, userId)
    }
  })
  const result = await Promise.all(updateUsersPromises)

  const updatedUserIds = users.map(({id}) => id)
  const data = {userIds: updatedUserIds}
  return data
}

export default removeAuthIdentity
