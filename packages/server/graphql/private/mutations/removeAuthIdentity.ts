import base64url from 'base64url'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import {AuthIdentityTypeEnum, Security} from 'parabol-client/types/constEnums'
import {r} from 'rethinkdb-ts'
import util from 'util'
import AuthIdentityLocal from '../../../database/types/AuthIdentityLocal'
import PasswordResetRequest from '../../../database/types/PasswordResetRequest'
import getMailManager from '../../../email/getMailManager'
import resetPasswordEmailCreator from '../../../email/resetPasswordEmailCreator'
import generateRandomString from '../../../generateRandomString'
import getUsersByDomain from '../../../postgres/queries/getUsersByDomain'
import updateUser from '../../../postgres/queries/updateUser'
import {MutationResolvers} from '../../private/resolverTypes'

const randomBytes = util.promisify(crypto.randomBytes)

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
  const updateUsersPromises = users.map(async (user) => {
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
      return updateUser({identities: newIdentities}, userId)
    } else {
      return updateUser({identities: filteredIdentities}, userId)
    }
  })
  await Promise.all(updateUsersPromises)

  // send forgot password email
  users.forEach(async ({email}) => {
    const tokenBuffer = await randomBytes(48)
    const resetPasswordToken = base64url.encode(tokenBuffer)
    // invalidate all other tokens for this email
    await r
      .table('PasswordResetRequest')
      .getAll(email, {index: 'email'})
      .filter({isValid: true})
      .update({isValid: false})
      .run()
    await r
      .table('PasswordResetRequest')
      .insert(new PasswordResetRequest({ip, email, token: resetPasswordToken}))
      .run()
    const {subject, body, html} = resetPasswordEmailCreator({resetPasswordToken})
    await getMailManager().sendEmail({
      to: email,
      subject,
      body,
      html,
      tags: ['type:resetPassword']
    })
  })

  const updatedUserIds = users.map(({id}) => id)
  const data = {userIds: updatedUserIds}
  return data
}

export default removeAuthIdentity
