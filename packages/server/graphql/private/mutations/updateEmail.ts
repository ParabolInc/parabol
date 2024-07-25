import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {MutationResolvers} from '../resolverTypes'

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
