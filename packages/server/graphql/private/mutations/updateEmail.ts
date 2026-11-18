import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import type {JsonObject} from '../../../postgres/types/pg'
import type {MutationResolvers} from '../resolverTypes'

const updateEmail: MutationResolvers['updateEmail'] = async (_source, {oldEmail, newEmail}) => {
  const pg = getKysely()

  // VALIDATION
  if (oldEmail === newEmail) {
    throw new GraphQLError('New email is the same as the old one', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const user = await pg
    .selectFrom('User')
    .selectAll()
    .where('email', '=', oldEmail)
    .executeTakeFirst()

  if (!user) {
    throw new GraphQLError(`User with ${oldEmail} not found`, {extensions: {code: 'NOT_FOUND'}})
  }

  const {id: userId, identities} = user

  if (identities && identities.length > 0) {
    const localIdentity = (identities as JsonObject[]).find((identity) => identity.type === 'LOCAL')
    if (localIdentity) {
      localIdentity.isEmailVerified = false
    }
  }

  // Update the email along with the identity
  await pg
    .updateTable('User')
    .set({email: newEmail, identities: identities})
    .where('id', '=', userId)
    .execute()

  return true
}

export default updateEmail
