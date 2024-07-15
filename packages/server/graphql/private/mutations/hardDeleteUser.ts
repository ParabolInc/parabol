import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getPg from '../../../postgres/getPg'
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
      await r
        .table('NewMeeting')
        .get(meetingId)
        .update({
          facilitatorUserId: otherMember.userId
        })
        .run()
    } else {
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
  const pg = getPg()

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
  const teamMemberIds = teamMembers.map(({id}) => id)
  const meetingIds = meetingMembers.map(({meetingId}) => meetingId)

  const discussions = await pg.query(`SELECT "id" FROM "Discussion" WHERE "teamId" = ANY ($1);`, [
    teamIds
  ])
  const teamDiscussionIds = discussions.rows.map(({id}) => id)

  // soft delete first for side effects
  const tombstoneId = await softDeleteUser(userIdToDelete, dataLoader)

  // all other writes
  await setFacilitatedUserIdOrDelete(userIdToDelete, teamIds, dataLoader)
  await r({
    nullifyCreatedBy: r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
      .update({createdBy: null})
      .run(),
    teamMember: r.table('TeamMember').getAll(userIdToDelete, {index: 'userId'}).delete(),
    meetingMember: r.table('MeetingMember').getAll(userIdToDelete, {index: 'userId'}).delete(),
    notification: r.table('Notification').getAll(userIdToDelete, {index: 'userId'}).delete(),
    suggestedAction: r.table('SuggestedAction').getAll(userIdToDelete, {index: 'userId'}).delete(),
    createdTasks: r
      .table('Task')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
      .delete(),
    agendaItem: r
      .table('AgendaItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RValue) => r(teamMemberIds).contains(row('teamMemberId')))
      .delete(),
    pushInvitation: r.table('PushInvitation').getAll(userIdToDelete, {index: 'userId'}).delete(),
    slackNotification: r
      .table('SlackNotification')
      .getAll(userIdToDelete, {index: 'userId'})
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
      .update({acceptedBy: ''}),
    comment: r
      .table('Comment')
      .getAll(r.args(teamDiscussionIds), {index: 'discussionId'})
      .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
      .update({
        createdBy: tombstoneId,
        isAnonymous: true
      })
  }).run()

  // now postgres, after FKs are added then triggers should take care of children
  // TODO when we're done migrating to PG, these should have constraints that ON DELETE CASCADE
  await Promise.all([
    pg.query(`DELETE FROM "AtlassianAuth" WHERE "userId" = $1`, [userIdToDelete]),
    pg.query(`DELETE FROM "GitHubAuth" WHERE "userId" = $1`, [userIdToDelete]),
    pg.query(
      `DELETE FROM "TaskEstimate" WHERE "meetingId" = ANY($1::varchar[]) AND "userId" = $2`,
      [meetingIds, userIdToDelete]
    ),
    pg.query(
      `DELETE FROM "Poll" WHERE "discussionId" = ANY($1::varchar[]) AND "createdById" = $2`,
      [teamDiscussionIds, userIdToDelete]
    )
  ])

  // Send metrics to HubSpot before the user is really deleted in DB
  await sendAccountRemovedEvent(userIdToDelete, user.email, reasonText ?? '')

  // User needs to be deleted after children
  await pg.query(`DELETE FROM "User" WHERE "id" = $1`, [userIdToDelete])

  await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
  return {}
}

export default hardDeleteUser
