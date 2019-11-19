import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import getRethink from '../database/rethinkDriver'
import Meeting from '../database/types/Meeting'
import AtlassianManager from './AtlassianManager'
import {getUserId} from './authorization'
import {
  IAgendaItem,
  IAtlassianAuth,
  ICustomPhaseItem,
  INewFeatureBroadcast,
  IReflectTemplate,
  ITeam,
  ITeamMeetingSettings
} from '../../client/types/graphql'
import promiseAllPartial from '../../client/utils/promiseAllPartial'
import MeetingMember from '../database/types/MeetingMember'
import SlackAuth from '../database/types/SlackAuth'
import SlackNotification from '../database/types/SlackNotification'
import AuthToken from '../database/types/AuthToken'
import OrganizationUser from '../database/types/OrganizationUser'
import Reflection from '../database/types/Reflection'
import SuggestedAction from '../database/types/SuggestedAction'
import Task from '../database/types/Task'
import TeamInvitation from '../database/types/TeamInvitation'
import User from '../database/types/User'
import ReflectionGroup from '../database/types/ReflectionGroup'
import Notification from '../database/types/Notification'
import Organization from '../database/types/Organization'
import TeamMember from '../database/types/TeamMember'

interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

const defaultCacheKeyFn = (key) => key

const indexResults = (results, indexField, cacheKeyFn = defaultCacheKeyFn) => {
  const indexedResults = new Map()
  results.forEach((res) => {
    indexedResults.set(cacheKeyFn(res[indexField]), res)
  })
  return indexedResults
}

const normalizeRethinkDbResults = (keys, indexField, results, cacheKeyFn = defaultCacheKeyFn) => {
  const indexedResults = indexResults(results, indexField, cacheKeyFn)
  // return keys.map((val) => indexedResults.get(cacheKeyFn(val)) || new Error(`Key not found : ${val}`));
  return keys.map((val) => {
    const res = indexedResults.get(cacheKeyFn(val))
    if (!res) {
      // no need to send to sentry because half the time we are doing this in the validation step where it may not exist
      // const viewerId = getUserId(authToken)
      // sendToSentry(new Error(`dataloader not found for ${cacheKeyFn(val)}, on ${table}`), {
      //   userId: viewerId
      // })
      return null
    }
    return res
  })
}

// as we build out more constructors we can move away from using the gql types
interface Tables {
  AgendaItem: IAgendaItem
  AtlassianAuth: IAtlassianAuth
  CustomPhaseItem: ICustomPhaseItem
  MeetingSettings: ITeamMeetingSettings
  MeetingMember: MeetingMember
  NewMeeting: Meeting
  NewFeature: INewFeatureBroadcast
  Notification: Notification
  Organization: Organization
  OrganizationUser: OrganizationUser
  ReflectTemplate: IReflectTemplate
  RetroReflectionGroup: ReflectionGroup
  RetroReflection: Reflection
  SlackAuth: SlackAuth
  SlackNotification: SlackNotification
  SuggestedAction: SuggestedAction
  Task: Task
  TeamMember: TeamMember
  TeamInvitation: TeamInvitation
  Team: ITeam
  User: User
}

export default class RethinkDataLoader {
  dataLoaderOptions: DataLoader.Options<any, any>
  authToken: null | AuthToken

  constructor(
    authToken: AuthToken | null = null,
    dataLoaderOptions: DataLoader.Options<any, any> = {}
  ) {
    this.authToken = authToken
    this.dataLoaderOptions = dataLoaderOptions
  }

  private fkLoader<T = any>(
    standardLoader: DataLoader<string, T>,
    field: string,
    fetchFn: (ids: string[]) => any[] | Promise<any[]>
  ) {
    const batchFn = async (ids) => {
      const items = await fetchFn(ids)
      items.forEach((item) => {
        standardLoader.clear(item.id).prime(item.id, item)
      })
      return ids.map((id) => items.filter((item) => item[field] === id))
    }
    return new DataLoader<string, T[]>(batchFn, this.dataLoaderOptions)
  }

  private pkLoader<T extends keyof Tables>(table: T) {
    // don't pass in a a filter here because they requested a specific ID, they know what they want
    const batchFn = async (keys) => {
      const r = await getRethink()
      const docs = await r
        .table(table)
        .getAll(r.args(keys), {index: 'id'})
        .run()
      return normalizeRethinkDbResults(keys, 'id', docs)
    }
    return new DataLoader<string, Tables[T]>(batchFn, this.dataLoaderOptions)
  }

  agendaItems = this.pkLoader('AgendaItem')
  atlassianAuths = this.pkLoader('AtlassianAuth')
  customPhaseItems = this.pkLoader('CustomPhaseItem')
  meetingSettings = this.pkLoader('MeetingSettings')
  meetingMembers = this.pkLoader('MeetingMember')
  newMeetings = this.pkLoader('NewMeeting')
  newFeatures = this.pkLoader('NewFeature')
  notifications = this.pkLoader('Notification')
  organizations = this.pkLoader('Organization')
  organizationUsers = this.pkLoader('OrganizationUser')
  reflectTemplates = this.pkLoader('ReflectTemplate')
  retroReflectionGroups = this.pkLoader('RetroReflectionGroup')
  retroReflections = this.pkLoader('RetroReflection')
  slackAuths = this.pkLoader('SlackAuth')
  slackNotifications = this.pkLoader('SlackNotification')
  suggestedActions = this.pkLoader('SuggestedAction')
  tasks = this.pkLoader('Task')
  teamMembers = this.pkLoader('TeamMember')
  teamInvitations = this.pkLoader('TeamInvitation')
  teams = this.pkLoader('Team')
  users = this.pkLoader('User')

  activeMeetingsByTeamId = this.fkLoader(this.newMeetings, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('NewMeeting')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({endedAt: null}, {default: true})
      .orderBy(r.desc('createdAt'))
      .run()
  })

  agendaItemsByTeamId = this.fkLoader(this.agendaItems, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('AgendaItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .orderBy('sortOrder')
      .run()
  })

  atlassianAuthByUserId = this.fkLoader(this.atlassianAuths, 'userId', async (userIds) => {
    const r = await getRethink()
    return r
      .table('AtlassianAuth')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  })

  customPhaseItemsByTeamId = this.fkLoader(this.customPhaseItems, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('CustomPhaseItem')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .run()
  })

  meetingMembersByMeetingId = this.fkLoader(
    this.meetingMembers,
    'meetingId',
    async (meetingIds) => {
      const r = await getRethink()
      return r
        .table('MeetingMember')
        .getAll(r.args(meetingIds), {index: 'meetingId'})
        .run()
    }
  )

  meetingSettingsByTeamId = this.fkLoader(this.meetingSettings, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('MeetingSettings')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  })

  organizationUsersByOrgId = this.fkLoader(this.organizationUsers, 'orgId', async (orgIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(orgIds), {index: 'orgId'})
      .filter({removedAt: null})
      .run()
  })

  organizationUsersByUserId = this.fkLoader(this.organizationUsers, 'userId', async (userIds) => {
    const r = await getRethink()
    return r
      .table('OrganizationUser')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  })

  retroReflectionGroupsByMeetingId = this.fkLoader(
    this.retroReflectionGroups,
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

  reflectTemplatesByTeamId = this.fkLoader(this.reflectTemplates, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('ReflectTemplate')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isActive: true})
      .run()
  })

  retroReflectionsByMeetingId = this.fkLoader(
    this.retroReflections,
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

  slackAuthByUserId = this.fkLoader(this.slackAuths, 'userId', async (userIds) => {
    const r = await getRethink()
    return r
      .table('SlackAuth')
      .getAll(r.args(userIds), {index: 'userId'})
      .run()
  })

  slackNotificationsByTeamId = this.fkLoader(this.slackNotifications, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('SlackNotification')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .run()
  })

  suggestedActionsByUserId = this.fkLoader(this.suggestedActions, 'userId', async (userIds) => {
    const r = await getRethink()
    return r
      .table('SuggestedAction')
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({removedAt: null})
      .run()
  })

  tasksByTeamId = this.fkLoader(this.tasks, 'teamId', async (teamIds) => {
    const r = await getRethink()
    const userId = getUserId(this.authToken)
    return r
      .table('Task')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((task) =>
        task('tags')
          .contains('private')
          .and(task('userId').ne(userId))
          .or(task('tags').contains('archived'))
          .not()
      )
      .run()
  })

  tasksByUserId = this.fkLoader(this.tasks, 'userId', async (_userIds) => {
    const r = await getRethink()
    const userId = getUserId(this.authToken)
    const tms = (this.authToken && this.authToken.tms) || []
    return r
      .table('Task')
      .getAll(userId, {index: 'userId'})
      .filter((task) =>
        r.and(
          task('tags')
            .contains('archived')
            .not(),
          // weed out the tasks on archived teams
          r(tms).contains(task('teamId'))
        )
      )
      .run()
  })

  teamsByOrgId = this.fkLoader(this.teams, 'orgId', async (orgIds) => {
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

  teamInvitationsByTeamId = this.fkLoader(this.teamInvitations, 'teamId', async (teamIds) => {
    const r = await getRethink()
    const now = new Date()
    return r
      .table('TeamInvitation')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({acceptedAt: null})
      .filter((row) => row('expiresAt').ge(now))
      .run()
  })

  teamMembersByTeamId = this.fkLoader(this.teamMembers, 'teamId', async (teamIds) => {
    const r = await getRethink()
    return r
      .table('TeamMember')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter({isNotRemoved: true})
      .run()
  })

  freshAtlassianAccessToken = new DataLoader<{teamId: string; userId: string}, string>(
    async (keys: {userId: string; teamId: string}[]) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await this.atlassianAuthByUserId.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AtlassianManager.refresh(refreshToken)
          const {accessToken} = manager
          const r = await getRethink()
          await r
            .table('AtlassianAuth')
            .getAll(userId, {index: 'userId'})
            .filter({teamId})
            .update({accessToken, updatedAt: now})
            .run()
          return accessToken
        })
      )
    },
    {
      ...this.dataLoaderOptions,
      cacheKeyFn: (key: {teamId: string; userId: string}) => `${key.userId}:${key.teamId}`
    }
  )

  jiraRemoteProject = new DataLoader(
    async (keys: JiraRemoteProjectKey[]) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, cloudId, atlassianProjectId}) => {
          const manager = new AtlassianManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...this.dataLoaderOptions,
      cacheKeyFn: (key: JiraRemoteProjectKey) => `${key.atlassianProjectId}:${key.cloudId}`
    }
  )
}
