import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {MutationResolvers} from '../resolverTypes'
import {JsonObject} from '../../../postgres/types/pg'

const updateEmail: MutationResolvers['updateEmail'] = async (_source, {oldEmail, newEmail}) => {
  const pg = getKysely()

  // VALIDATION
  if (oldEmail === newEmail) {
    throw new Error('New email is the same as the old one')
  }

  const user = await getUserByEmail(oldEmail)
  if (!user) {
    throw new Error(`User with ${oldEmail} not found`)
  }

  // Update isEmailVerified to false for the old email
  // Part 1: Get identities for the user from db
  const currentIdentitiesQuery = await pg
    .selectFrom('User')
    .select('identities')
    .where('email', '=', oldEmail)
    .limit(1)
    .executeTakeFirst()

  if (!currentIdentitiesQuery) {
    throw new Error(`User with ${oldEmail} not found`)
  }

  const identitiesArray = currentIdentitiesQuery.identities

  // Part 2: Update the last element of identities array
  if (identitiesArray && identitiesArray.length > 0) {
    const lastIndex = identitiesArray.length - 1
    const lastElement = identitiesArray[lastIndex] as JsonObject;
    lastElement!.isEmailVerified = false
  } else {
    throw new Error('Empty Identities array!')
  }

  // Part 3: Update the identities in the database
  await pg
    .updateTable('User')
    .set({
      identities: identitiesArray,
    })
    .where('email', '=', oldEmail)
    .execute()

  // RESOLUTION
  const {id: userId} = user
  await pg
    .with('TeamMemberUpdate', (qc) =>
      qc.updateTable('TeamMember').set({email: newEmail}).where('userId', '=', userId)
    )
    .updateTable('User')
    .set({email: newEmail})
    .where('id', '=', userId)
    .execute()

  return true
}

export default updateEmail
