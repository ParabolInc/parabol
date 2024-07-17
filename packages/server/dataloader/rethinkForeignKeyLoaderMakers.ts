import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import RethinkForeignKeyLoaderMaker from './RethinkForeignKeyLoaderMaker'

export const activeMeetingsByTeamId = new RethinkForeignKeyLoaderMaker(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({endedAt: null}, {default: true})
      .orderBy(r.desc('createdAt'))
      .run()
  }
)

export const agendaItemsByTeamId = new RethinkForeignKeyLoaderMaker(
  'agendaItems',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('AgendaItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('sortOrder')
      .run()
  }
)

export const agendaItemsByMeetingId = new RethinkForeignKeyLoaderMaker(
  'agendaItems',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('AgendaItem')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .orderBy('sortOrder')
      .run()
  }
)

export const commentsByDiscussionId = new RethinkForeignKeyLoaderMaker(
  'comments',
  'discussionId',
  async (discussionIds) => {
    const r = await getRethink()
    return (
      r
        .table('Comment')
        .getAll(r.args(discussionIds), {index: 'discussionId'})
        // include deleted comments so we can replace them with tombstones
        // .filter({isActive: true})
        .run()
    )
  }
)

export const completedMeetingsByTeamId = new RethinkForeignKeyLoaderMaker(
  'newMeetings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RDatum) => row('endedAt').default(null).ne(null))
      .orderBy(r.desc('endedAt'))
      .run()
  }
)

export const reflectPromptsByTemplateId = new RethinkForeignKeyLoaderMaker(
  'reflectPrompts',
  'templateId',
  async (templateIds) => {
    const r = await getRethink()
    return r
      .table('ReflectPrompt')
      .getAll(r.args(templateIds), {index: 'templateId'})
      .orderBy('sortOrder')
      .run()
  }
)

export const massInvitationsByTeamMemberId = new RethinkForeignKeyLoaderMaker(
  'massInvitations',
  'teamMemberId',
  async (teamMemberIds) => {
    const r = await getRethink()
    return r
      .table('MassInvitation')
      .getAll(r.args(teamMemberIds), {index: 'teamMemberId'})
      .orderBy(r.desc('expiration'))
      .run()
  }
)
export const meetingMembersByMeetingId = new RethinkForeignKeyLoaderMaker(
  'meetingMembers',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r.table('MeetingMember').getAll(r.args(meetingIds), {index: 'meetingId'}).run()
  }
)

export const meetingMembersByUserId = new RethinkForeignKeyLoaderMaker(
  'meetingMembers',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r.table('MeetingMember').getAll(r.args(userIds), {index: 'userId'}).run()
  }
)

export const scalesByTeamId = new RethinkForeignKeyLoaderMaker(
  'templateScales',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('TemplateScale')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((row: RDatum) => row('removedAt').default(null).eq(null))
      .orderBy('sortOrder')
      .run()
  }
)

export const templateDimensionsByTemplateId = new RethinkForeignKeyLoaderMaker(
  'templateDimensions',
  'templateId',
  async (templateIds) => {
    const r = await getRethink()
    return (
      r
        .table('TemplateDimension')
        .getAll(r.args(templateIds), {index: 'templateId'})
        // NOTE: isActive must be false so we can see meetings in the past that use a now-inactive template
        // .filter({isActive: true})
        .orderBy('sortOrder')
        .run()
    )
  }
)

export const slackAuthByUserId = new RethinkForeignKeyLoaderMaker(
  'slackAuths',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r.table('SlackAuth').getAll(r.args(userIds), {index: 'userId'}).run()
  }
)

export const slackNotificationsByTeamId = new RethinkForeignKeyLoaderMaker(
  'slackNotifications',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r.table('SlackNotification').getAll(r.args(teamIds), {index: 'teamId'}).run()
  }
)

export const suggestedActionsByUserId = new RethinkForeignKeyLoaderMaker(
  'suggestedActions',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('SuggestedAction')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  }
)

export const tasksByDiscussionId = new RethinkForeignKeyLoaderMaker(
  'tasks',
  'discussionId',
  async (discusisonIds) => {
    const r = await getRethink()
    return (
      r
        .table('Task')
        .getAll(r.args(discusisonIds), {index: 'discussionId'})
        // include archived cards in the conversation, since it's persistent
        .run()
    )
  }
)

export const tasksByTeamId = new RethinkForeignKeyLoaderMaker(
  'tasks',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    // waraning! contains private tasks
    return r
      .table('Task')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((task: RDatum) => task('tags').contains('archived').not())
      .run()
  }
)

export const teamInvitationsByTeamId = new RethinkForeignKeyLoaderMaker(
  'teamInvitations',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    const now = new Date()
    return r
      .table('TeamInvitation')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({acceptedAt: null})
      .filter((row: RDatum) => row('expiresAt').ge(now))
      .run()
  }
)
