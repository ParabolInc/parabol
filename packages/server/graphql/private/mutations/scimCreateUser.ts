import {USER_PREFERRED_NAME_LIMIT} from '../../../postgres/constants'
import User from '../../../database/types/User'
import {MutationResolvers} from '../resolverTypes'
import generateUID from '../../../generateUID'
import {generateIdenticon} from '../../private/mutations/helpers/generateIdenticon'
import {AuthIdentityTypeEnum} from '../../../../client/types/constEnums'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import bootstrapNewUser from '../../mutations/helpers/bootstrapNewUser'

const scimCreateUser: MutationResolvers['scimCreateUser'] = async (
  _source,
  {email: denormEmail, preferredName},
  {dataLoader}
) => {
  const email = denormEmail.toLowerCase().trim()
  if (email.length > USER_PREFERRED_NAME_LIMIT) {
    return {error: {message: 'Email is too long'}}
  }

  const userId = `local|${generateUID()}`
  const newUser = new User({
    id: userId,
    preferredName,
    email,
    picture: await generateIdenticon(userId, preferredName),
    identities: []
  })
  const identityId = `${userId}:${AuthIdentityTypeEnum.LOCAL}`
  newUser.identities.push(new AuthIdentityLocal({hashedPassword: 'foo', id: identityId, isEmailVerified: true}))
  await bootstrapNewUser(newUser, false, dataLoader)
 
  return {
    userId: newUser.id,
    isNewUser: true
  }
}

export default scimCreateUser
