import {GraphQLError} from 'graphql'
import {Threshold} from 'parabol-client/types/constEnums'
import {USER_REASON_REMOVED_LIMIT} from '../../../postgres/constants'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import updateUser from '../../../postgres/queries/updateUser'
import {unsetAuthCookie} from '../../../utils/authCookie'
import {getUserId, isSuperUser} from '../../../utils/authorization'
import {blacklistJWT} from '../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../utils/epochTime'
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
    throw new GraphQLError('Provide userId XOR email', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (!userId && !email) {
    throw new GraphQLError('Provide a userId or email', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const su = isSuperUser(authToken)
  const viewerId = getUserId(authToken)
  const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
  const validReason = reason?.trim().slice(0, USER_REASON_REMOVED_LIMIT) || 'No reason provided'

  if (!su) {
    if (!user || userId !== viewerId) {
      throw new GraphQLError('Cannot delete someone else', {extensions: {code: 'FORBIDDEN'}})
    }
    const now = toEpochSeconds(new Date())
    if (now - authToken.iat > Threshold.REAUTH_WINDOW_SECONDS) {
      throw new GraphQLError('Please re-authenticate before deleting your account', {
        extensions: {code: 'UNAUTHENTICATED'}
      })
    }
  } else if (!user) {
    throw new GraphQLError('User not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const {id: userIdToDelete} = user
  const pageIds = (await dataLoader.get('pageAccessByUserId').load(userIdToDelete)).map(
    (p) => p.pageId
  )

  const deletedUserEmail = await softDeleteUser(userIdToDelete, dataLoader)
  await markUserSoftDeleted(userIdToDelete, deletedUserEmail, validReason)

  await broadcastUserMentionUpdate(userIdToDelete, 'Deactivated User', dataLoader, pageIds)

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()) + 1)

  if (userId === viewerId) {
    unsetAuthCookie(context)
  }

  return {}
}

export default deleteUser
