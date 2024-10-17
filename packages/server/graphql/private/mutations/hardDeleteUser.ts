import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import blacklistJWT from '../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../utils/epochTime'
import sendAccountRemovedEvent from '../../mutations/helpers/sendAccountRemovedEvent'
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
  const [teamMembers, meetingMembers] = await Promise.all([
    dataLoader.get('teamMembersByUserId').load(userIdToDelete),
    dataLoader.get('meetingMembersByUserId').load(userIdToDelete)
  ])
  const teamIds = teamMembers.map(({teamId}) => teamId)
  const meetingIds = meetingMembers.map(({meetingId}) => meetingId)

  const discussions = teamIds.length
    ? await pg.selectFrom('Discussion').select('id').where('id', 'in', teamIds).execute()
    : []
  const teamDiscussionIds = discussions.map(({id}) => id)

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

  // Send metrics to HubSpot before the user is really deleted in DB
  await sendAccountRemovedEvent(userIdToDelete, user.email, reasonText ?? '')

  // User needs to be deleted after children
  await pg.deleteFrom('User').where('id', '=', userIdToDelete).execute()

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
  return {}
}

export default hardDeleteUser
