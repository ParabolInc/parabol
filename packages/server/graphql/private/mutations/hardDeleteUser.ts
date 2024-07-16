import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getPg from '../../../postgres/getPg'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import blacklistJWT from '../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../utils/epochTime'
import sendAccountRemovedEvent from '../../mutations/helpers/sendAccountRemovedEvent'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import {MutationResolvers} from '../resolverTypes'

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
  const [teamMemberIds, meetingIds] = await Promise.all([
    r
      .table('TeamMember')
      .getAll(userIdToDelete, {index: 'userId'})
      .getField('id')
      .coerceTo('array')
      .run(),
    r
      .table('MeetingMember')
      .getAll(userIdToDelete, {index: 'userId'})
      .getField('meetingId')
      .coerceTo('array')
      .run()
  ])
  const teamIds = teamMemberIds.map((id) => TeamMemberId.split(id).teamId)

  // need to fetch these upfront
  const [onePersonMeetingIds, swapFacilitatorUpdates, swapCreatedByUserUpdates, discussions] =
    await Promise.all([
      (
        r
          .table('MeetingMember')
          .getAll(r.args(meetingIds), {index: 'meetingId'})
          .group('meetingId') as any
      )
        .count()
        .ungroup()
        .filter((row: RValue) => row('reduction').le(1))
        .map((row: RValue) => row('group'))
        .coerceTo('array')
        .run(),
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row: RValue) => row('facilitatorUserId').eq(userIdToDelete))
        .merge((meeting: RValue) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row: RValue) => row('userId').ne(userIdToDelete))
            .nth(0)
            .getField('userId')
            .default(null)
        }))
        .filter(r.row.hasFields('otherTeamMember'))
        .pluck('id', 'otherTeamMember')
        .run(),
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row: RValue) => row('createdBy').eq(userIdToDelete))
        .merge((meeting: RValue) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row: RValue) => row('userId').ne(userIdToDelete))
            .nth(0)
            .getField('userId')
            .default(null)
        }))
        .filter(r.row.hasFields('otherTeamMember'))
        .pluck('id', 'otherTeamMember')
        .run(),
      pg.query(`SELECT "id" FROM "Discussion" WHERE "teamId" = ANY ($1);`, [teamIds])
    ])
  const teamDiscussionIds = discussions.rows.map(({id}) => id)

  // soft delete first for side effects
  const tombstoneId = await softDeleteUser(userIdToDelete, dataLoader)

  // all other writes
  await r({
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
      }),
    onePersonMeetings: r
      .table('NewMeeting')
      .getAll(r.args(onePersonMeetingIds), {index: 'id'})
      .delete(),
    swapFacilitator: r(swapFacilitatorUpdates).forEach((update) =>
      r
        .table('NewMeeting')
        .get(update('id'))
        .update({
          facilitatorUserId: update('otherTeamMember') as unknown as string
        })
    ),
    swapCreatedByUser: r(swapCreatedByUserUpdates).forEach((update) =>
      r
        .table('NewMeeting')
        .get(update('id'))
        .update({
          createdBy: update('otherTeamMember') as unknown as string
        })
    )
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
