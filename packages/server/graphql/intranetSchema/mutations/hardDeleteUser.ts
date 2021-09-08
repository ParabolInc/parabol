import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {GQLContext} from '../../graphql'
import {requireSU} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import getPg from '../../../postgres/getPg'
import softDeleteUser from '../../mutations/helpers/softDeleteUser'
import DeleteUserPayload from '../../types/DeleteUserPayload'
import User from '../../../database/types/User'

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
      type: GraphQLString,
      description: 'the reason why the user wants to delete their account'
    }
  },
  resolve: async (
    _source,
    {userId, email, reason}: {userId?: string; email?: string; reason?: string},
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

    const index = userId ? 'id' : 'email'
    const user = (await r
      .table('User')
      .getAll((userId || email)!, {index})
      .nth(0)
      .default(null)
      .run()) as User
    if (!user) {
      return {error: {message: 'User not found'}}
    }
    const userIdToDelete = user.id

    // rethink first
    await softDeleteUser(user, dataLoader, reason)

    const teamMemberIds = await r
      .table('TeamMember')
      .getAll(userIdToDelete, {index: 'userId'})
      .getField('id')
      .coerceTo('array')
      .distinct()
      .run()
    const teamIds: string[] = []
    for (const teamMemberId of teamMemberIds) {
      const teamId = teamMemberId.split('::')[1]
      if (teamId) {
        teamIds.push(teamId)
      }
    }
    const [retroReflectionIds, swapFacilitatorUpdates, discussions] = await Promise.all([
      (r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .eqJoin('id', r.table('RetroReflection'), {index: 'meetingId'})
        .zip() as any)
        .filter((row) => row('creatorId').eq(r(userIdToDelete)))
        .getField('id')
        .coerceTo('array')
        .distinct()
        .run(),
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('facilitatorUserId').eq(r(userIdToDelete)))
        .merge((meeting) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row) => row('userId').ne(r(userIdToDelete)))
            .nth(0)
            .getField('userId')
            .default(null)
        }))
        .filter(r.row.hasFields('otherTeamMember'))
        .pluck('id', 'otherTeamMember')
        .run(),
      pg.query(`SELECT "id" FROM "Discussion" WHERE "teamId" = ANY ($1);`, [teamIds])
    ])
    const discussionIds = discussions.rows.map(({id}) => id)

    await r({
      user: r
        .table('User')
        .get(userIdToDelete)
        .delete(),
      teamMember: r
        .table('TeamMember')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      meetingMember: r
        .table('MeetingMember')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      atlassianAuth: r
        .table('AtlassianAuth')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      notification: r
        .table('Notification')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      organizationUser: r
        .table('OrganizationUser')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      suggestedAction: r
        .table('SuggestedAction')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      // note: no effect since soft delete user resolves beforehand
      assignedTasks: r
        .table('Task')
        .getAll(userIdToDelete, {index: 'userId'})
        .update({userId: null}),
      createdTasks: r
        .table('Task')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('createdBy').eq(r(userIdToDelete)))
        .update({createdBy: ''}),
      timelineEvent: r
        .table('TimelineEvent')
        .between([userIdToDelete, r.minval], [userIdToDelete, r.maxval], {
          index: 'userIdCreatedAt'
        })
        .delete(),
      agendaItem: r
        .table('AgendaItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) =>
          r(teamMemberIds).contains(r(userIdToDelete).add(r.expr('::'), row('teamId')))
        )
        .update({teamMemberId: ''}),
      pushInvitation: r
        .table('PushInvitation')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      retroReflection: r
        .table('RetroReflection')
        .getAll(r.args(retroReflectionIds), {index: 'id'})
        .update({creatorId: ''}),
      slackNotification: r
        .table('SlackNotification')
        .getAll(userIdToDelete, {index: 'userId'})
        .delete(),
      invitedByTeamInvitation: r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('invitedBy').eq(r(userIdToDelete)))
        .update({invitedBy: ''}),
      createdByTeamInvitations: r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('acceptedBy').eq(r(userIdToDelete)))
        .update({acceptedBy: ''}),
      comment: r
        .table('Comment')
        .getAll(r.args(discussionIds), {index: 'discussionId'})
        .filter((row) => row('createdBy').eq(r(userIdToDelete)))
        .update({createdBy: ''}),
      swapFacilitator: r(swapFacilitatorUpdates).forEach((update) =>
        r
          .table('NewMeeting')
          .get(update('id'))
          .update({
            facilitatorUserId: (update('otherTeamMember') as unknown) as string
          })
      )
    }).run()

    // now postgres, after FKs are added then triggers should take care of children
    await pg.query(`DELETE FROM "User" WHERE "id" = $1`, [userIdToDelete])

    return {}
  }
}

export default hardDeleteUser
