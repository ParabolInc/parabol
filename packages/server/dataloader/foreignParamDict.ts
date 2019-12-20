import getRethink from '../database/rethinkDriver'
import {pkLoaderToTable} from './pkLoader'

class ForeignLoaderParams {
  constructor(
    public pk: keyof typeof pkLoaderToTable,
    public field: string,
    public fetch: (ids: string[]) => Promise<any[]>
  ) {}
}

const activeMeetingsByTeamId = new ForeignLoaderParams('newMeetings', 'teamId', async (teamIds) => {
  const r = await getRethink()
  return r
    .table('NewMeeting')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({endedAt: null}, {default: true})
    .orderBy(r.desc('createdAt'))
    .run()
})

const agendaItemsByTeamId = new ForeignLoaderParams('agendaItems', 'teamId', async (teamIds) => {
  const r = await getRethink()
  return r
    .table('AgendaItem')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({isActive: true})
    .orderBy('sortOrder')
    .run()
})

const atlassianAuthByUserId = new ForeignLoaderParams(
  'atlassianAuths',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('AtlassianAuth')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  }
)

const customPhaseItemsByTeamId = new ForeignLoaderParams(
  'customPhaseItems',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('CustomPhaseItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .run()
  }
)

const meetingMembersByMeetingId = new ForeignLoaderParams(
  'meetingMembers',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('MeetingMember')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .run()
  }
)

const meetingSettingsByTeamId = new ForeignLoaderParams(
  'meetingSettings',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('MeetingSettings')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  }
)

const organizationUsersByOrgId = new ForeignLoaderParams(
  'organizationUsers',
  'orgId',
  async (orgIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(orgIds), {index: 'orgId'})
      .filter({removedAt: null})
      .run()
  }
)

const organizationUsersByUserId = new ForeignLoaderParams(
  'organizationUsers',
  'userId',
  async (userIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  }
)

const retroReflectionGroupsByMeetingId = new ForeignLoaderParams(
  'retroReflectionGroups',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('RetroReflectionGroup')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .filter({isActive: true})
      .run()
  }
)

const reflectTemplatesByTeamId = new ForeignLoaderParams(
  'reflectTemplates',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('ReflectTemplate')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .run()
  }
)

const retroReflectionsByMeetingId = new ForeignLoaderParams(
  'retroReflections',
  'meetingId',
  async (meetingIds) => {
    const r = await getRethink()
    return r
      .table('RetroReflection')
      .getAll(r.args(meetingIds), {index: 'meetingId'})
      .filter({isActive: true})
      .run()
  }
)

const slackAuthByUserId = new ForeignLoaderParams('slackAuths', 'userId', async (userIds) => {
  const r = await getRethink()
  return r
    .table('SlackAuth')
    .getAll(r.args(userIds), {index: 'userId'})
    .run()
})

const slackNotificationsByTeamId = new ForeignLoaderParams(
  'slackNotifications',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    return r
      .table('SlackNotification')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  }
)

const suggestedActionsByUserId = new ForeignLoaderParams(
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

const teamsByOrgId = new ForeignLoaderParams('teams', 'orgId', async (orgIds) => {
  const r = await getRethink()
  return r
    .table('Team')
    .getAll(r.args(orgIds), {index: 'orgId'})
    .filter((team) =>
      team('isArchived')
        .default(false)
        .ne(true)
    )
    .run()
})

const tasksByTeamId = new ForeignLoaderParams('tasks', 'teamId', async (teamIds) => {
  const r = await getRethink()
  // waraning! contains private tasks
  return r
    .table('Task')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter((task) =>
      task('tags')
        .contains('archived')
        .not()
    )
    .run()
})

const teamMembersByTeamId = new ForeignLoaderParams('teamMembers', 'teamId', async (teamIds) => {
  // tasksByUserId is expensive since we have to look up each team to check the team archive status
  const r = await getRethink()
  return r
    .table('TeamMember')
    .getAll(r.args(teamIds), {index: 'teamId'})
    .filter({isNotRemoved: true})
    .run()
})

const foreignParamDict = {
  activeMeetingsByTeamId,
  agendaItemsByTeamId,
  atlassianAuthByUserId,
  customPhaseItemsByTeamId,
  meetingMembersByMeetingId,
  meetingSettingsByTeamId,
  organizationUsersByOrgId,
  organizationUsersByUserId,
  retroReflectionGroupsByMeetingId,
  reflectTemplatesByTeamId,
  retroReflectionsByMeetingId,
  slackAuthByUserId,
  slackNotificationsByTeamId,
  suggestedActionsByUserId,
  tasksByTeamId,
  teamsByOrgId,
  teamMembersByTeamId
}

export default foreignParamDict
