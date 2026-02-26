import {USER_REASON_REMOVED_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import updateUser from '../../../postgres/queries/updateUser'
import {analytics} from '../../../utils/analytics/analytics'
import {unsetAuthCookie} from '../../../utils/authCookie'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import {broadcastUserMentionUpdate} from '../../../utils/tiptap/hocusPocusHub'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import type {MutationResolvers} from '../resolverTypes'

const markUserSoftDeleted = async (
  userIdToDelete: string,
  deletedUserEmail: string,
  validReason: string
) => {
  await updateUser(
    {
      isRemoved: true,
      email: deletedUserEmail,
      reasonRemoved: validReason,
      persistentNameId: null,
      updatedAt: new Date()
    },
    userIdToDelete
  )
}

const deleteUser: MutationResolvers['deleteUser'] = async (
  _source,
  {userId, email, reason},
  context
) => {
  const {authToken, dataLoader} = context
  // AUTH
  if (userId && email) {
    return {error: {message: 'Provide userId XOR email'}}
  }
  if (!userId && !email) {
    return {error: {message: 'Provide a userId or email'}}
  }
  const su = isSuperUser(authToken)
  const viewerId = getUserId(authToken)
  const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
  const validReason = reason?.trim().slice(0, USER_REASON_REMOVED_LIMIT) || 'No reason provided'

  if (!su) {
    if (!user || userId !== viewerId) {
      return {error: {message: 'Cannot delete someone else'}}
    }
  } else if (!user) {
    return {error: {message: 'User not found'}}
  }
  const {id: userIdToDelete} = user
  const pageIds = (await dataLoader.get('pageAccessByUserId').load(userIdToDelete)).map(
    (p) => p.pageId
  )

  const deletedUserEmail = await softDeleteUser(userIdToDelete, dataLoader)
  await markUserSoftDeleted(userIdToDelete, deletedUserEmail, validReason)

  await broadcastUserMentionUpdate(userIdToDelete, 'Deactivated User', dataLoader, pageIds)

  analytics.accountRemoved(user, validReason)

  if (userId === viewerId) {
    unsetAuthCookie(context)
  }

  return {}
}

export default deleteUser
