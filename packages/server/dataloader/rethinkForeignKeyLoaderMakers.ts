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
