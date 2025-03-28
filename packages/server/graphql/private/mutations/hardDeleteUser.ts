import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {analytics} from '../../../utils/analytics/analytics'
import blacklistJWT from '../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../utils/epochTime'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import {MutationResolvers} from '../resolverTypes'

const setFacilitatedUserIdOrDelete = async (
  userIdToDelete: string,
  teamIds: string[],
  dataLoader: DataLoaderInstance
) => {
  const pg = getKysely()
  const facilitatedMeetings = await pg
    .selectFrom('NewMeeting')
    .select('id')
    .where('teamId', 'in', teamIds)
    .where('createdBy', '=', userIdToDelete)
    .execute()

  facilitatedMeetings.map(async (meeting) => {
    const {id: meetingId} = meeting
    const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    const otherMember = meetingMembers.find(({userId}) => userId !== userIdToDelete)
    if (otherMember) {
      await pg
        .updateTable('NewMeeting')
        .set({facilitatorUserId: otherMember.userId})
        .where('id', '=', meetingId)
        .execute()
    } else {
      // single-person meeting must be deleted because facilitatorUserId must be non-null
      await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
    }
  })
}

const hardDeleteUser: MutationResolvers['hardDeleteUser'] = async (
  _source,
  {userId, email, reasonText},
  {dataLoader}
) => {
  // VALIDATION
  if (userId && email) {
    return {error: {message: 'Provide userId XOR email'}}
  }
  if (!userId && !email) {
    return {error: {message: 'Provide a userId or email'}}
  }
  const pg = getKysely()

  const user = userId ? await getUserById(userId) : email ? await getUserByEmail(email) : null
  if (!user) {
    return {error: {message: 'User not found'}}
  }
  const userIdToDelete = user.id

  // get team ids and meetingIds
  const teamMembers = await dataLoader.get('teamMembersByUserId').load(userIdToDelete)
  const teamIds = teamMembers.map(({teamId}) => teamId)

  // soft delete first for side effects
  await softDeleteUser(userIdToDelete, dataLoader)

  // all other writes
  await setFacilitatedUserIdOrDelete(userIdToDelete, teamIds, dataLoader)
  await pg
    .updateTable('NewMeeting')
    .set({createdBy: null})
    .where('teamId', 'in', teamIds)
    .where('createdBy', '=', userIdToDelete)
    .execute()

  analytics.accountRemoved(user, reasonText ?? '')

  // User needs to be deleted after children
  await pg.deleteFrom('User').where('id', '=', userIdToDelete).execute()

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
  return {}
}

export default hardDeleteUser
