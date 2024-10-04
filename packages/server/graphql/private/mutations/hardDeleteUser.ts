import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
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
  const r = await getRethink()
  const facilitatedMeetings = await r
    .table('NewMeeting')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
    .run()
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
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          facilitatorUserId: otherMember.userId
        })
        .run()
    } else {
      await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
      // single-person meeting must be deleted because facilitatorUserId must be non-null
      await r.table('NewMeeting').get(meetingId).delete().run()
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
  const r = await getRethink()
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

  const discussions = await pg
    .selectFrom('Discussion')
    .select('id')
    .where('id', 'in', teamIds)
    .execute()
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
  await r({
    nullifyCreatedBy: r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
      .update({createdBy: null})
      .run(),
    meetingMember: r.table('MeetingMember').getAll(userIdToDelete, {index: 'userId'}).delete(),
    notification: r.table('Notification').getAll(userIdToDelete, {index: 'userId'}).delete(),
    createdTasks: r
      .table('Task')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
      .delete(),
    invitedByTeamInvitation: r
      .table('TeamInvitation')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('invitedBy').eq(userIdToDelete))
      .delete(),
    createdByTeamInvitations: r
      .table('TeamInvitation')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('acceptedBy').eq(userIdToDelete))
      .update({acceptedBy: ''})
  }).run()

  // now postgres, after FKs are added then triggers should take care of children
  // TODO when we're done migrating to PG, these should have constraints that ON DELETE CASCADE
  await pg
    .with('AtlassianAuthDelete', (qb) =>
      qb.deleteFrom('AtlassianAuth').where('userId', '=', userIdToDelete)
    )
    .with('GitHubAuthDelete', (qb) =>
      qb.deleteFrom('GitHubAuth').where('userId', '=', userIdToDelete)
    )
    .with('TaskEstimateDelete', (qb) =>
      qb
        .deleteFrom('TaskEstimate')
        .where('userId', '=', userIdToDelete)
        .where('meetingId', 'in', meetingIds)
    )
    .deleteFrom('Poll')
    .where('discussionId', 'in', teamDiscussionIds)
    .where('createdById', '=', userIdToDelete)
    .execute()

  // Send metrics to HubSpot before the user is really deleted in DB
  await sendAccountRemovedEvent(userIdToDelete, user.email, reasonText ?? '')

  // User needs to be deleted after children
  await pg.deleteFrom('User').where('id', '=', userIdToDelete).execute()

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
  return {}
}

export default hardDeleteUser
