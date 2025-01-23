import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'
import {JsonObject} from '../../../postgres/types/pg'

const updateEmail: MutationResolvers['updateEmail'] = async (_source, {oldEmail, newEmail}) => {
  const pg = getKysely()

  // VALIDATION
  if (oldEmail === newEmail) {
    throw new Error('New email is the same as the old one')
  }

  const user = await pg
    .selectFrom('User')
    .selectAll()
    .where('email', '=', oldEmail)
    .executeTakeFirst()

  if (!user) {
    throw new Error(`User with ${oldEmail} not found`)
  }

  //Use identities array for the user above
  const identitiesArray = user.identities

  // Update the identities array for AuthIdentityLocal, isEmailVerified=false
  if (identitiesArray && identitiesArray.length > 0) {
    const localIdentity = (identitiesArray as JsonObject[]).find((identity: JsonObject) => identity.type === 'LOCAL')
    if (localIdentity) {
      localIdentity.isEmailVerified = false
    }
  }

  // Update the email along with the identity
  const {id: userId} = user
  await pg
    .with('TeamMemberUpdate', (qc) =>
      qc.updateTable('TeamMember').set({email: newEmail}).where('userId', '=', userId)
    )
    .updateTable('User')
    .set({email: newEmail, identities: identitiesArray})
    .where('id', '=', userId)
    .execute()

  return true
}

export default updateEmail
