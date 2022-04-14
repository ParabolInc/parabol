import DataLoader from 'dataloader'
import getRethink, {RethinkSchema} from '../database/rethinkDriver'
import MeetingSettingsTeamPrompt from '../database/types/MeetingSettingsTeamPrompt'
import MeetingTemplate from '../database/types/MeetingTemplate'
import OrganizationUser from '../database/types/OrganizationUser'
import {Reactable, ReactableEnum} from '../database/types/Reactable'
import Task, {TaskStatusEnum} from '../database/types/Task'
import {IGetLatestTaskEstimatesQueryResult} from '../postgres/queries/generated/getLatestTaskEstimatesQuery'
import getGitHubAuthByUserIdTeamId, {
  GitHubAuth
} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import getGitHubDimensionFieldMaps, {
  GitHubDimensionFieldMap
} from '../postgres/queries/getGitHubDimensionFieldMaps'
import getGitLabDimensionFieldMaps, {
  GitLabDimensionFieldMap
} from '../postgres/queries/getGitLabDimensionFieldMaps'
import getLatestTaskEstimates from '../postgres/queries/getLatestTaskEstimates'
import getMeetingTaskEstimates, {
  MeetingTaskEstimatesResult
} from '../postgres/queries/getMeetingTaskEstimates'
import {MeetingTypeEnum} from '../postgres/types/Meeting'
import getRedis from '../utils/getRedis'
import normalizeResults from './normalizeResults'
import RootDataLoader from './RootDataLoader'

export interface MeetingSettingsKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

export interface MeetingTemplateKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

export interface ReactablesKey {
  id: string
  type: ReactableEnum
}

export interface UserTasksKey {
  first: number
  after?: Date
  userIds: string[]
  teamIds: string[]
  archived?: boolean
  statusFilters: TaskStatusEnum[]
  filterQuery?: string
  includeUnassigned?: boolean
}

const reactableLoaders = [
  {type: 'COMMENT', loader: 'comments'},
  {type: 'REFLECTION', loader: 'retroReflections'},
  {type: 'RESPONSE', loader: 'teamPromptResponses', keyType: 'number'}
] as const

export const serializeUserTasksKey = (key: UserTasksKey) => {
  const {userIds, teamIds, first, after, archived, statusFilters, filterQuery} = key
  const parts = [
    (userIds?.length && userIds.sort().join(':')) || '*',
    teamIds.sort().join(':'),
    first,
    after || '*',
    archived,
    (statusFilters?.length && statusFilters.sort().join(':')) || '*',
    filterQuery || '*'
  ]
  return parts.join(':')
}

export const commentCountByDiscussionId = (parent: RootDataLoader) => {
  return new DataLoader<string, number, string>(
    async (discussionIds) => {
      const r = await getRethink()
      const groups = (await (
        r
          .table('Comment')
          .getAll(r.args(discussionIds as string[]), {index: 'discussionId'})
          .group('discussionId') as any
      )
        .count()
        .ungroup()
        .run()) as {group: string; reduction: number}[]
      const lookup: Record<string, number> = {}
      groups.forEach(({group, reduction}) => {
        lookup[group] = reduction
      })
      return discussionIds.map((discussionId) => lookup[discussionId] || 0)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const latestTaskEstimates = (parent: RootDataLoader) => {
  return new DataLoader<string, IGetLatestTaskEstimatesQueryResult[], string>(
    async (taskIds) => {
      const rows = await getLatestTaskEstimates(taskIds)
      return taskIds.map((taskId) => rows.filter((row) => row.taskId === taskId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const meetingTaskEstimates = (parent: RootDataLoader) => {
  return new DataLoader<{meetingId: string; taskId: string}, MeetingTaskEstimatesResult[], string>(
    async (keys) => {
      const meetingIds = keys.map(({meetingId}) => meetingId)
      const taskIds = keys.map(({taskId}) => taskId)

      const rows = await getMeetingTaskEstimates(taskIds, meetingIds)
      return keys.map(({meetingId, taskId}) =>
        rows.filter((row) => row.taskId === taskId && row.meetingId === meetingId)
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.meetingId}:${key.taskId}`
    }
  )
}

export const reactables = (parent: RootDataLoader) => {
  return new DataLoader<ReactablesKey, Reactable, string>(
    async (keys) => {
      const reactableResults = (await Promise.all(
        reactableLoaders.map(async (val) => {
          const ids = keys.filter((key) => key.type === val.type).map(({id}) => id)
          if (val.type === 'RESPONSE') {
            const numberIds = ids.map((id) => parseInt(id, 10))
            return parent.get(val.loader).loadMany(numberIds)
          }
          return parent.get(val.loader).loadMany(ids)
        })
      )) as Reactable[][]
      const reactables = reactableResults.flat()
      const keyIds = keys.map(({id}) => id)
      const ret = normalizeResults(keyIds, reactables)
      return ret
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.id}:${key.type}`
    }
  )
}

export const userTasks = (parent: RootDataLoader) => {
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
          const {
            first,
            after,
            userIds,
            teamIds,
            archived,
            statusFilters,
            filterQuery,
            includeUnassigned
          } = key
          const dbAfter = after ? new Date(after) : r.maxval

          let teamTaskPartial = r.table('Task').getAll(r.args(teamIds), {index: 'teamId'})
          if (userIds?.length) {
            teamTaskPartial = teamTaskPartial.filter((row) => r(userIds).contains(row('userId')))
          }
          if (statusFilters?.length) {
            teamTaskPartial = teamTaskPartial.filter((row) =>
              r(statusFilters).contains(row('status'))
            )
          }
          if (filterQuery) {
            // TODO: deal with tags like #archived and #private. should strip out of plaintextContent??
            teamTaskPartial = teamTaskPartial.filter(
              (row) => row('plaintextContent').match(filterQuery) as any
            )
          }

          return {
            key: serializeUserTasksKey(key),
            data: await teamTaskPartial
              .filter((task) => task('updatedAt').lt(dbAfter))
              .filter((task) =>
                archived
                  ? task('tags').contains('archived')
                  : task('tags').contains('archived').not()
              )
              .filter((task) => {
                if (includeUnassigned) return true
                return task('userId').ne(null)
              })
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
      return keys.map((key) => tasksByKey[serializeUserTasksKey(key)]!)
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: serializeUserTasksKey
    }
  )
}

export const githubAuth = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; userId: string}, GitHubAuth | null, string>(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, userId}) => getGitHubAuthByUserIdTeamId(userId, teamId))
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, userId}) => `${userId}:${teamId}`
    }
  )
}

export const gitlabDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; dimensionName: string; projectId: number; providerId: number},
    GitLabDimensionFieldMap | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, projectId, providerId}) =>
          getGitLabDimensionFieldMaps(teamId, dimensionName, projectId, providerId)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, dimensionName, projectId, providerId}) =>
        `${teamId}:${dimensionName}:${projectId}:${providerId}`
    }
  )
}

export const githubDimensionFieldMaps = (parent: RootDataLoader) => {
  return new DataLoader<
    {teamId: string; dimensionName: string; nameWithOwner: string},
    GitHubDimensionFieldMap | null,
    string
  >(
    async (keys) => {
      const results = await Promise.allSettled(
        keys.map(async ({teamId, dimensionName, nameWithOwner}) =>
          getGitHubDimensionFieldMaps(teamId, dimensionName, nameWithOwner)
        )
      )
      const vals = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
      return vals
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: ({teamId, dimensionName, nameWithOwner}) =>
        `${teamId}:${dimensionName}:${nameWithOwner}`
    }
  )
}

export const meetingSettingsByType = (parent: RootDataLoader) => {
  return new DataLoader<MeetingSettingsKey, RethinkSchema['MeetingSettings']['type'], string>(
    async (keys) => {
      const r = await getRethink()
      const types = {} as Record<MeetingTypeEnum, string[]>
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType].push(key.teamId)
      })
      const entries = Object.entries(types) as [MeetingTypeEnum, string[]][]
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          return r
            .table('MeetingSettings')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter({meetingType: meetingType})
            .run()
        })
      )
      const docs = resultsByType.flat()
      return keys.map((key) => {
        const {teamId, meetingType} = key
        // until we decide the final shape of the team prompt settings, let's return a temporary hardcoded value
        if (meetingType === 'teamPrompt') {
          return new MeetingSettingsTeamPrompt({teamId})
        }
        return docs.find((doc) => doc.teamId === teamId && doc.meetingType === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}

export const organizationUsersByUserIdOrgId = (parent: RootDataLoader) => {
  return new DataLoader<{orgId: string; userId: string}, OrganizationUser | null, string>(
    async (keys) => {
      const r = await getRethink()
      return Promise.all(
        keys.map((key) => {
          const {userId, orgId} = key
          return r
            .table('OrganizationUser')
            .getAll(userId, {index: 'userId'})
            .filter({orgId, removedAt: null})
            .nth(0)
            .default(null)
            .run()
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.orgId}:${key.userId}`
    }
  )
}

export const meetingTemplatesByType = (parent: RootDataLoader) => {
  return new DataLoader<MeetingTemplateKey, MeetingTemplate[], string>(
    async (keys) => {
      const r = await getRethink()
      const types = {} as Record<MeetingTypeEnum, string[]>
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType].push(key.teamId)
      })
      const entries = Object.entries(types) as [MeetingTypeEnum, string[]][]
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          return r
            .table('MeetingTemplate')
            .getAll(r.args(teamIds), {index: 'teamId'})
            .filter({type: meetingType, isActive: true})
            .run()
        })
      )
      const docs = resultsByType.flat()
      return keys.map((key) => {
        const {teamId, meetingType} = key
        return docs.filter((doc) => doc.teamId === teamId && doc.type === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}

export const taskIdsByTeamAndGitHubRepo = (parent: RootDataLoader) => {
  return new DataLoader<{teamId: string; nameWithOwner: string}, string[], string>(
    async (keys) => {
      const r = await getRethink()
      const res = await Promise.all(
        keys.map((key) => {
          const {teamId, nameWithOwner} = key
          // This is very expensive! We should move tasks to PG ASAP
          return r
            .table('Task')
            .getAll(teamId, {index: 'teamId'})
            .filter((row) => row('integration')('nameWithOwner').eq(nameWithOwner))('id')
            .run()
        })
      )
      return res
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.nameWithOwner}`
    }
  )
}

export const meetingHighlightedTaskId = (parent: RootDataLoader) => {
  return new DataLoader<string, string | null, string>(
    async (meetingIds) => {
      const redis = getRedis()
      const redisKeys = meetingIds.map((id) => `meetingTaskHighlight:${id}`)
      const highlightedTaskIds = await redis.mget(redisKeys)
      return highlightedTaskIds
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
