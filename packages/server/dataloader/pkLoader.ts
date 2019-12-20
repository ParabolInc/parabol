import DataLoader from 'dataloader'
import getRethink from '../database/rethinkDriver'
import {Tables} from './tables'

const normalizeRethinkDbResults = <T extends {id: string}>(keys: string[], results: T[]) => {
  const map = {} as {[key: string]: T}
  for (let i = 0; i < results.length; i++) {
    const result = results[i]
    map[result.id] = result
  }
  const mappedResults = [] as T[]
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    mappedResults.push(map[key])
  }
  return mappedResults
}

// as we build out more constructors we can move away from using the gql types
export const pkLoaderToTable = {
  agendaItems: 'AgendaItem',
  atlassianAuths: 'AtlassianAuth',
  customPhaseItems: 'CustomPhaseItem',
  meetingSettings: 'MeetingSettings',
  meetingMembers: 'MeetingMember',
  newMeetings: 'NewMeeting',
  newFeatures: 'NewFeature',
  notifications: 'Notification',
  organizations: 'Organization',
  organizationUsers: 'OrganizationUser',
  reflectTemplates: 'ReflectTemplate',
  retroReflectionGroups: 'RetroReflectionGroup',
  retroReflections: 'RetroReflection',
  slackAuths: 'SlackAuth',
  slackNotifications: 'SlackNotification',
  suggestedActions: 'SuggestedAction',
  tasks: 'Task',
  teamMembers: 'TeamMember',
  teamInvitations: 'TeamInvitation',
  teams: 'Team',
  users: 'User'
} as const

const pkLoader = <T extends keyof Tables>(
  options: DataLoader.Options<string, Tables[T]>,
  table: T
) => {
  // don't pass in a a filter here because they requested a specific ID, they know what they want
  const batchFn = async (keys) => {
    const r = await getRethink()
    const docs = await r
      .table(table)
      .getAll(r.args(keys), {index: 'id'})
      .run()
    return normalizeRethinkDbResults<Tables[T]>(keys, docs)
  }
  return new DataLoader<string, Tables[T]>(batchFn, options)
}

export default pkLoader
