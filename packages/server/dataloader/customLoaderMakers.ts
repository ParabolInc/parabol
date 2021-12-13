import DataLoader from 'dataloader'
import getRethink, {RethinkSchema} from '../database/rethinkDriver'
import {MeetingTypeEnum} from '../database/types/Meeting'
import MeetingTemplate from '../database/types/MeetingTemplate'
import {Reactable, ReactableEnum} from '../database/types/Reactable'
import Task, {TaskStatusEnum} from '../database/types/Task'
import getPg from '../postgres/getPg'
import {
  getDiscussionsByIdQuery,
  IGetDiscussionsByIdQueryResult
} from '../postgres/queries/generated/getDiscussionsByIdQuery'
import {IGetLatestTaskEstimatesQueryResult} from '../postgres/queries/generated/getLatestTaskEstimatesQuery'
import getGitHubAuthByUserIdTeamId, {
  GitHubAuth
} from '../postgres/queries/getGitHubAuthByUserIdTeamId'
import getGitHubDimensionFieldMaps, {
  GitHubDimensionFieldMap
} from '../postgres/queries/getGitHubDimensionFieldMaps'
import getLatestTaskEstimates from '../postgres/queries/getLatestTaskEstimates'
import getMeetingTaskEstimates, {
  MeetingTaskEstimatesResult
} from '../postgres/queries/getMeetingTaskEstimates'
import getTeamsByIds, {Team} from '../postgres/queries/getTeamsByIds'
import getTeamsByOrgIds from '../postgres/queries/getTeamsByOrgIds'
import getTemplateRefsById, {TemplateRef} from '../postgres/queries/getTemplateRefsById'
import getTemplateScaleRefsByIds, {
  TemplateScaleRef
} from '../postgres/queries/getTemplateScaleRefsByIds'
import {getUsersByIds} from '../postgres/queries/getUsersByIds'
import IUser from '../postgres/types/IUser'
import normalizeRethinkDbResults from './normalizeRethinkDbResults'
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
  {type: 'REFLECTION', loader: 'retroReflections'}
] as const

// export type LoaderMakerCustom<K, V, C = K> = (parent: RootDataLoader) => DataLoader<K, V, C>

// TODO: refactor if the interface pattern is used a total of 3 times

export const users = (parent: RootDataLoader) => {
  return new DataLoader<string, IUser | undefined, string>(
    async (userIds) => {
      const users = await getUsersByIds(userIds)
      return normalizeRethinkDbResults(userIds, users)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const teams = (parent: RootDataLoader) =>
  new DataLoader<string, Team, string>(
    async (teamIds) => {
      const teams = await getTeamsByIds(teamIds)
      return normalizeRethinkDbResults(teamIds, teams)
    },
    {
      ...parent.dataLoaderOptions
    }
  )

export const teamsByOrgIds = (parent: RootDataLoader) =>
  new DataLoader<string, Team[], string>(
    async (orgIds) => {
      const teamLoader = parent.get('teams')
      const teams = await getTeamsByOrgIds(orgIds, {isArchived: false})
      teams.forEach((team) => {
        teamLoader.clear(team.id).prime(team.id, team)
      })

      const teamsByOrgIds = teams.reduce((map, team) => {
        const teamsByOrgId = map[team.orgId] ?? []
        teamsByOrgId.push(team)
        map[team.orgId] = teamsByOrgId
        return map
      }, {} as {[key: string]: Team[]})
      return orgIds.map((orgId) => teamsByOrgIds[orgId] ?? [])
    },
    {
      ...parent.dataLoaderOptions
    }
  )

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
      return keys.map((key) => tasksByKey[serializeUserTasksKey(key)])
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: serializeUserTasksKey
    }
  )
}

// TODO abstract this out so we can use this easier with PG
export const discussions = (parent: RootDataLoader) => {
  return new DataLoader<string, IGetDiscussionsByIdQueryResult | null, string>(
    async (keys) => {
      const rows = await getDiscussionsByIdQuery.run({ids: keys as string[]}, getPg())
      return keys.map((key) => rows.find((row) => row.id === key) || null)
    },
    {
      ...parent.dataLoaderOptions
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
        return docs.find((doc) => doc.teamId === teamId && doc.meetingType === meetingType)!
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
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

export const templateRefs = (parent: RootDataLoader) => {
  return new DataLoader<string, TemplateRef, string>(
    async (refIds) => {
      const templateRefs = await getTemplateRefsById(refIds)
      return refIds.map((refId) => templateRefs.find((ref) => ref.id === refId)!)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const templateScaleRefs = (parent: RootDataLoader) => {
  return new DataLoader<string, TemplateScaleRef, string>(
    async (refIds) => {
      const templateScaleRefs = await getTemplateScaleRefsByIds(refIds)
      return refIds.map((refId) => templateScaleRefs.find((ref) => ref.id === refId)!)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
