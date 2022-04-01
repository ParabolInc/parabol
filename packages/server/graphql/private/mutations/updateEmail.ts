import getRethink from '../../../database/rethinkDriver'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import updateUser from '../../../postgres/queries/updateUser'
import {MutationResolvers} from '../resolverTypes'

const updateEmail: MutationResolvers['updateEmail'] = async (_source, {oldEmail, newEmail}) => {
  const r = await getRethink()

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
  const updates = {
    email: newEmail,
    updatedAt: new Date()
  }
  await Promise.all([
    r.table('User').get(userId).update(updates).run(),
    r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update({
        email: newEmail
      })
      .run(),
    updateUser(updates, userId)
  ])

  return true
}

export default updateEmail
