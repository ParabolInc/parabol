import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import TeamMemberId from 'parabol-client/shared/gqlIds/TeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RValue} from '../../../database/stricterR'
import getPg from '../../../postgres/getPg'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {getUserById} from '../../../postgres/queries/getUsersByIds'
import {requireSU} from '../../../utils/authorization'
import blacklistJWT from '../../../utils/blacklistJWT'
import {toEpochSeconds} from '../../../utils/epochTime'
import {GQLContext} from '../../graphql'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import DeleteUserPayload from '../../types/DeleteUserPayload'

const hardDeleteUser = {
  type: GraphQLNonNull(DeleteUserPayload),
  description: 'hard deletes a user and all its associated objects',
  args: {
    userId: {
      type: GraphQLID,
      description: 'a userId'
    },
    email: {
      type: GraphQLID,
      description: 'the user email'
    },
    reasonText: {
      /* this is passed to segment track method under properties via `softDeleteUser` resolver fn */
      type: GraphQLString,
      description: 'the reason why the user wants to delete their account'
    }
  },
  resolve: async (
    _source: unknown,
    {userId, email, reasonText}: {userId?: string; email?: string; reasonText?: string},
    {authToken, dataLoader}: GQLContext
  ) => {
    // AUTH
    requireSU(authToken)

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
    const [
      onePersonMeetingIds,
      retroReflectionIds,
      swapFacilitatorUpdates,
      swapCreatedByUserUpdates,
      discussions
    ] = await Promise.all([
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
      (
        r
          .table('NewMeeting')
          .getAll(r.args(teamIds), {index: 'teamId'})
          .filter((row) => row('meetingType').eq('retro'))
          .eqJoin('id', r.table('RetroReflection'), {index: 'meetingId'})
          .zip() as any
      )
        .filter((row: RValue) => row('creatorId').eq(userIdToDelete))
        .getField('id')
        .coerceTo('array')
        .distinct()
        .run(),
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('facilitatorUserId').eq(userIdToDelete))
        .merge((meeting: RValue) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row) => row('userId').ne(userIdToDelete))
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
        .filter((row) => row('createdBy').eq(userIdToDelete))
        .merge((meeting: RValue) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row) => row('userId').ne(userIdToDelete))
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
    const tombstoneId = await softDeleteUser(userIdToDelete, dataLoader, authToken, reasonText)

    // all other writes
    await r({
      teamMember: r.table('TeamMember').getAll(userIdToDelete, {index: 'userId'}).delete(),
      meetingMember: r.table('MeetingMember').getAll(userIdToDelete, {index: 'userId'}).delete(),
      notification: r.table('Notification').getAll(userIdToDelete, {index: 'userId'}).delete(),
      organizationUser: r
        .table('OrganizationUser')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      suggestedAction: r
        .table('SuggestedAction')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      createdTasks: r
        .table('Task')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('createdBy').eq(userIdToDelete))
        .delete(),
      timelineEvent: r
        .table('TimelineEvent')
        .between([userIdToDelete, r.minval], [userIdToDelete, r.maxval], {
          index: 'userIdCreatedAt'
        })
        .delete(),
      agendaItem: r
        .table('AgendaItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => r(teamMemberIds).contains(row('teamMemberId')))
        .delete(),
      pushInvitation: r.table('PushInvitation').getAll(userIdToDelete, {index: 'userId'}).delete(),
      retroReflection: r
        .table('RetroReflection')
        .getAll(r.args(retroReflectionIds), {index: 'id'})
        .update({creatorId: tombstoneId}),
      slackNotification: r
        .table('SlackNotification')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      invitedByTeamInvitation: r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('invitedBy').eq(userIdToDelete))
        .delete(),
      createdByTeamInvitations: r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('acceptedBy').eq(userIdToDelete))
        .update({acceptedBy: ''}),
      comment: r
        .table('Comment')
        .getAll(r.args(teamDiscussionIds), {index: 'discussionId'})
        .filter((row) => row('createdBy').eq(userIdToDelete))
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
    // User needs to be deleted after children
    await pg.query(`DELETE FROM "User" WHERE "id" = $1`, [userIdToDelete])

    await blacklistJWT(userIdToDelete, toEpochSeconds(new Date()))
    return {}
  }
}

export default hardDeleteUser
