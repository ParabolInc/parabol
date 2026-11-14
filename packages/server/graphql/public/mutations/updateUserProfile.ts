import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import linkify from 'parabol-client/utils/linkify'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import {broadcastUserMentionUpdate} from '../../../utils/tiptap/hocusPocusHub'
import type {MutationResolvers} from '../resolverTypes'

const updateUserProfile: MutationResolvers['updateUserProfile'] = async (
  _source,
  {updatedUser},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  const userId = getUserId(authToken)

  // VALIDATION
  const {preferredName} = updatedUser
  if (!preferredName) {
    return {error: {message: 'Must include a new name'}}
  }
  const normalizedPreferredName = preferredName.trim()
  if (normalizedPreferredName.length < 2) {
    return {error: {message: 'C’mon, you call that a name?'}}
  }
  if (normalizedPreferredName.length > 100) {
    return {error: {message: 'I want your name, not your life story'}}
  }

  if (normalizedPreferredName) {
    const links = linkify.match(normalizedPreferredName)
    if (links) {
      return {
        error: {message: 'Name cannot be a hyperlink'}
      }
    }
  }

  // RESOLUTION
  // propagate denormalized changes to TeamMember
  await pg
    .updateTable('User')
    .set({preferredName: normalizedPreferredName})
    .where('id', '=', userId)
    .execute()
  dataLoader.clearAll(['users', 'teamMembers'])

  const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
  if (normalizedPreferredName) {
    await broadcastUserMentionUpdate(userId, normalizedPreferredName, dataLoader)
  }

  const teamIds = teamMembers.map(({teamId}) => teamId)
  teamIds.forEach((teamId) => {
    const data = {userId}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
  })
  return {userId}
}

export default updateUserProfile
