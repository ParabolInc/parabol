import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import linkify from 'parabol-client/utils/linkify'
import getRethink from '../../../database/rethinkDriver'
import TeamMember from '../../../database/types/TeamMember'
import updateUser from '../../../postgres/queries/updateUser'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId, isAuthenticated} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import {MutationResolvers} from '../resolverTypes'

const updateUserProfile: MutationResolvers['updateUserProfile'] = async (
  _source,
  {updatedUser},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const r = await getRethink()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
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
  const updateObj = {
    preferredName: normalizedPreferredName
  }
  const [teamMembers] = await Promise.all([
    r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
      .update(updateObj, {returnChanges: true})('changes')('new_val')
      .default([])
      .run() as unknown as TeamMember[],
    updateUser(updateObj, userId)
  ])

  const user = await dataLoader.get('users').loadNonNull(userId)
  if (normalizedPreferredName) {
    analytics.accountNameChanged(user, normalizedPreferredName)
    analytics.identify({
      userId,
      email: user.email,
      name: normalizedPreferredName
    })
  }

  const teamIds = teamMembers.map(({teamId}) => teamId)
  teamIds.forEach((teamId) => {
    const data = {userId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'UpdateUserProfilePayload', data, subOptions)
  })
  return {userId, teamIds}
}

export default updateUserProfile
