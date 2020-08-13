import DataLoader from 'dataloader'
import {decode} from 'jsonwebtoken'
import {MeetingTypeEnum, ReactableEnum, ThreadSourceEnum} from 'parabol-client/types/graphql'
import promiseAllPartial from 'parabol-client/utils/promiseAllPartial'
import getRethink from '../database/rethinkDriver'
import MeetingSettings from '../database/types/MeetingSettings'
import {Reactable} from '../database/types/Reactable'
import Task from '../database/types/Task'
import {ThreadSource} from '../database/types/ThreadSource'
import AtlassianServerManager from '../utils/AtlassianServerManager'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'
import ProxiedCache from './ProxiedCache'
import RethinkDataLoader from './RethinkDataLoader'

type AccessTokenKey = {teamId: string; userId: string}
export interface JiraRemoteProjectKey {
  accessToken: string
  cloudId: string
  atlassianProjectId: string
}

export interface UserTasksKey {
  first: number
  after: number | string
  userIds: string[] | null
  teamIds: string[]
  archived: boolean
}

export interface ReactablesKey {
  id: string
  type: ReactableEnum
}

export interface ThreadSourceKey {
  sourceId: string
  type: ThreadSourceEnum
}

export interface MeetingSettingsKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

const reactableLoaders = [
  {type: ReactableEnum.COMMENT, loader: 'comments'},
  {type: ReactableEnum.REFLECTION, loader: 'retroReflections'}
] as const

const threadableLoaders = [
  {type: ThreadSourceEnum.AGENDA_ITEM, loader: 'agendaItems'},
  {type: ThreadSourceEnum.REFLECTION_GROUP, loader: 'retroReflectionGroups'}
] as const

// export type LoaderMakerCustom<K, V, C = K> = (parent: RethinkDataLoader) => DataLoader<K, V, C>

// TODO: refactor if the interface pattern is used a total of 3 times

export const users = () => {
  return new ProxiedCache('User')
}

export const serializeUserTasksKey = (key: UserTasksKey) => {
  const userIdKey = key.userIds ? key.userIds.sort().join(':') : '*'
  return `${userIdKey}:${key.teamIds.sort().join(':')}:${key.first}:${key.after}:${key.archived}`
}

export const commentCountByThreadId = (parent: RethinkDataLoader) => {
  return new DataLoader<string, number, string>(
    async (threadIds) => {
      const r = await getRethink()
      const groups = (await (r
        .table('Comment')
        .getAll(r.args(threadIds as string[]), {index: 'threadId'})
        .group('threadId') as any)
        .count()
        .ungroup()
        .run()) as {group: string; reduction: number}[]
      const lookup = {}
      groups.forEach(({group, reduction}) => {
        lookup[group] = reduction
      })
      return threadIds.map((threadId) => lookup[threadId] || 0)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const reactables = (parent: RethinkDataLoader) => {
  return new DataLoader<ReactablesKey, Reactable, string>(
    async (keys) => {
      const reactableResults = (await Promise.all(
        reactableLoaders.map((val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({id}) => id)
          return parent.get(val.loader).loadMany(ids)
        })
      )) as Reactable[][]
      const reactables = reactableResults.flat()
      const keyIds = keys.map(({id}) => id)
      const ret = normalizeRethinkDbResults(keyIds, reactables)
      return ret
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.id}:${key.type}`
    }
  )
}

export const threadSources = (parent: RethinkDataLoader) => {
  return new DataLoader<ThreadSourceKey, ThreadSource, string>(
    async (keys) => {
      const threadableResults = (await Promise.all(
        threadableLoaders.map((val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({sourceId}) => sourceId)
          return parent.get(val.loader).loadMany(ids)
        })
      )) as ThreadSource[][]
      const threadables = threadableResults.flat()
      const keyIds = keys.map(({sourceId}) => sourceId)
      return normalizeRethinkDbResults(keyIds, threadables)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.sourceId}:${key.type}`
    }
  )
}

export const userTasks = (parent: RethinkDataLoader) => {
  return new DataLoader<UserTasksKey, Task[], string>(
    async (keys) => {
      const r = await getRethink()
      const uniqKeys = [] as UserTasksKey[]
      const keySet = new Set()
      keys.forEach((key) => {
        const serializedKey = serializeUserTasksKey(key)
        if (!keySet.has(serializedKey)) {
          keySet.add(serializedKey)
          uniqKeys.push(key)
        }
      })
      const taskLoader = parent.get('tasks')

      const entryArray = await Promise.all(
        uniqKeys.map(async (key) => {
          const {first, after, userIds, teamIds, archived} = key
          const dbAfter = after ? new Date(after) : r.maxval

          let teamTaskPartial = r.table('Task').getAll(r.args(teamIds), {index: 'teamId'})
          if (userIds) {
            teamTaskPartial = teamTaskPartial.filter((row) => r(userIds).contains(row('userId')))
          }

          return {
            key: serializeUserTasksKey(key),
            data: await teamTaskPartial
              .filter((task) => task('updatedAt').lt(dbAfter))
              .filter((task) =>
                archived
                  ? task('tags').contains('archived')
                  : task('tags')
                      .contains('archived')
                      .not()
              )
              .orderBy(r.desc('updatedAt'))
              .limit(first + 1)
              .run()
          }
        })
      )

      const tasksByKey = Object.assign(
        {},
        ...entryArray.map((entry) => ({[entry.key]: entry.data}))
      ) as {[key: string]: Task[]}
      const tasks = Object.values(tasksByKey)
      tasks.flat().forEach((task) => {
        taskLoader.clear(task.id).prime(task.id, task)
      })

      return keys.map((key) => tasksByKey[serializeUserTasksKey(key)])
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: serializeUserTasksKey
    }
  )
}

export const freshAtlassianAccessToken = (parent: RethinkDataLoader) => {
  const userAuthLoader = parent.get('atlassianAuthByUserId')
  return new DataLoader<AccessTokenKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({userId, teamId}) => {
          const userAuths = await userAuthLoader.load(userId)
          const teamAuth = userAuths.find((auth) => auth.teamId === teamId)
          if (!teamAuth || !teamAuth.refreshToken) return null
          const {accessToken: existingAccessToken, refreshToken} = teamAuth
          const decodedToken = existingAccessToken && (decode(existingAccessToken) as any)
          const now = new Date()
          if (decodedToken && decodedToken.exp >= Math.floor(now.getTime() / 1000)) {
            return existingAccessToken
          }
          // fetch a new one
          const manager = await AtlassianServerManager.refresh(refreshToken)
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
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.userId}:${key.teamId}`
    }
  )
}

export const jiraRemoteProject = (parent: RethinkDataLoader) => {
  return new DataLoader<JiraRemoteProjectKey, string, string>(
    async (keys) => {
      return promiseAllPartial(
        keys.map(async ({accessToken, cloudId, atlassianProjectId}) => {
          const manager = new AtlassianServerManager(accessToken)
          return manager.getProject(cloudId, atlassianProjectId)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.atlassianProjectId}:${key.cloudId}`
    }
  )
}

export const meetingSettingsByType = (parent: RethinkDataLoader) => {
  return new DataLoader<MeetingSettingsKey, MeetingSettings, string>(
    async (keys) => {
      const r = await getRethink()
      const types = {} as {[meetingType: string]: string[]}
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType].push(key.teamId)
      })
      const entries = Object.entries(types)
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          return r
            .table('MeetingSettings')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter({meetingType: meetingType as MeetingTypeEnum})
            .run()
        })
      )
      const docs = resultsByType.flat()
      return keys.map((key) => {
        const {teamId, meetingType} = key
        return docs.find((doc) => doc.teamId === teamId && doc.meetingType === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}
