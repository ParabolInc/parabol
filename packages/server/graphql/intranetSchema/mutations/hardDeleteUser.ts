import {GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {GQLContext} from '../../graphql'
import {requireSU} from '../../../utils/authorization'
import getRethink from '../../../database/rethinkDriver'
import getPg from '../../../postgres/getPg'

const hardDeleteUser = {
  type: GraphQLNonNull(GraphQLString),
  description: 'hard deletes a user and all its associated objects',
  args: {
    userId: {
      type: GraphQLNonNull(GraphQLID)
    },
    reasonText: {
      type: GraphQLString
    }
  },
  resolve: async (_source, {userId}, {authToken}: GQLContext) => {
    // AUTH
    requireSU(authToken)

    // VALIDATION
    const r = await getRethink()
    const pg = getPg()

    const user = await r
      .table('User')
      .get(userId)
      .run()
    if (!user) {
      throw new Error(`User for userId not found`)
    }
    // rethink first
    const teamMemberIds = await r
      .table('TeamMember')
      .getAll(userId, {index: 'userId'})
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
        .filter((row) => row('creatorId').eq(r(userId)))
        .getField('id')
        .coerceTo('array')
        .distinct()
        .run(),
      r
        .table('NewMeeting')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('facilitatorUserId').eq(r(userId)))
        .merge((meeting) => ({
          otherTeamMember: r
            .table('TeamMember')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter((row) => row('userId').ne(r(userId)))
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
        .get(userId)
        .delete(),
      teamMember: r
        .table('TeamMember')
        .getAll(userId, {index: 'userId'})
        .delete(),
      meetingMember: r
        .table('MeetingMember')
        .getAll(userId, {index: 'userId'})
        .delete(),
      atlassianAuth: r
        .table('AtlassianAuth')
        .getAll(userId, {index: 'userId'})
        .delete(),
      notification: r
        .table('Notification')
        .getAll(userId, {index: 'userId'})
        .delete(),
      organizationUser: r
        .table('OrganizationUser')
        .getAll(userId, {index: 'userId'})
        .delete(),
      suggestedAction: r
        .table('SuggestedAction')
        .getAll(userId, {index: 'userId'})
        .delete(),
      task: r
        .table('Task')
        .getAll(userId, {index: 'userId'})
        .delete(),
      timelineEvent: r
        .table('TimelineEvent')
        .between([userId, r.minval], [userId, r.maxval], {
          index: 'userIdCreatedAt'
        })
        .delete(),
      agendaItem: r
        .table('AgendaItem')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => r(teamMemberIds).contains(row('id')))
        .delete(),
      pushInvitation: r
        .table('PushInvitation')
        .getAll(userId, {index: 'userId'})
        .delete(),
      retroReflection: r
        .table('RetroReflection')
        .getAll(r.args(retroReflectionIds), {index: 'id'})
        .delete(),
      slackNotification: r
        .table('SlackNotification')
        .getAll(userId, {index: 'userId'})
        .delete(),
      teamInvitation: r
        .table('TeamInvitation')
        .getAll(r.args(teamIds), {index: 'teamId'})
        .filter((row) => row('invitedBy').eq(r(userId)))
        .delete(),
      comment: r
        .table('Comment')
        .getAll(r.args(discussionIds), {index: 'discussionId'})
        .filter((row) => row('createdBy').eq(r(userId)))
        .delete(),
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
    await pg.query(`DELETE FROM "User" WHERE "id" = $1`, [userId])

    return `Success! User has been hard deleted`
  }
}

export default hardDeleteUser
