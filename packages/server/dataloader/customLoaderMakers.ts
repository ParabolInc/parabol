import DataLoader from 'dataloader'
import {Selectable, SqlBool, sql} from 'kysely'
import {PARABOL_AI_USER_ID} from '../../client/utils/constants'
import MeetingTemplate from '../database/types/MeetingTemplate'
import getFileStoreManager from '../fileStorage/getFileStoreManager'
import isValid from '../graphql/isValid'
import {ReactableEnum} from '../graphql/public/resolverTypes'
import {SAMLSource} from '../graphql/public/types/SAML'
import getKysely from '../postgres/getKysely'
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
import {
  selectMeetingSettings,
  selectNewMeetings,
  selectTasks,
  selectTeams
} from '../postgres/select'
import {
  FeatureFlag,
  Insight,
  MeetingSettings,
  OrganizationUser,
  Task,
  Team
} from '../postgres/types'
import {AnyMeeting, MeetingTypeEnum} from '../postgres/types/Meeting'
import {TeamMeetingTemplate} from '../postgres/types/pg'
import {Logger} from '../utils/Logger'
import getRedis from '../utils/getRedis'
import isUserVerified from '../utils/isUserVerified'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader, {RegisterDependsOn} from './RootDataLoader'
import normalizeArrayResults from './normalizeArrayResults'
import normalizeResults from './normalizeResults'

export interface MeetingSettingsKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

export interface MeetingTemplateKey {
  teamId: string
  meetingType: MeetingTypeEnum
}

export interface ReactablesKey {
  id: string | number
  type: ReactableEnum
}

export interface UserTasksKey {
  first: number
  after?: Date | null
  userIds: string[]
  teamIds: string[]
  archived?: boolean
  statusFilters?: Task['status'][] | null
  filterQuery?: string | null
  includeUnassigned?: boolean
}

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

export const commentCountByDiscussionId = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('comments')
  return new DataLoader<string, number, string>(
    async (discussionIds) => {
      const commentsByDiscussionId = await Promise.all(
        discussionIds.map((discussionId) => parent.get('commentsByDiscussionId').load(discussionId))
      )
      return commentsByDiscussionId.map((commentArr) => {
        const activeHumanComments = commentArr.filter(
          (comment) => comment.isActive && comment.createdBy !== PARABOL_AI_USER_ID
        )
        return activeHumanComments.length
      })
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

export const userTasks = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('tasks')
  return new DataLoader<UserTasksKey, Task[], string>(
    async (keys) => {
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
          if (teamIds.length === 0)
            return {
              key: serializeUserTasksKey(key),
              data: []
            }
          const hasUserIds = userIds?.length > 0
          const hasStatusFilters = statusFilters ? statusFilters.length > 0 : false
          const teamTasks = await selectTasks()
            .where('teamId', 'in', teamIds)
            .$if(hasUserIds, (qb) => qb.where('userId', 'in', userIds))
            .$if(hasStatusFilters, (qb) => qb.where('status', 'in', statusFilters!))
            .$if(!!filterQuery, (qb) => qb.where('plaintextContent', 'ilike', `%${filterQuery}%`))
            .$if(!!after, (qb) => qb.where('updatedAt', '<', after!))
            .$if(!!archived, (qb) => qb.where(sql<boolean>`'archived' = ANY(tags)`))
            .$if(!archived, (qb) => qb.where(sql<boolean>`'archived' != ALL(tags)`))
            .$if(!includeUnassigned, (qb) => qb.where('userId', 'is not', null))
            .orderBy('updatedAt', 'desc')
            .limit(first + 1)
            .execute()
          return {
            key: serializeUserTasksKey(key),
            data: teamTasks
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

export const meetingSettingsByType = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('meetingSettings')
  return new DataLoader<MeetingSettingsKey, MeetingSettings, string>(
    async (keys) => {
      const res = await selectMeetingSettings()
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('teamId', 'meetingType'),
            'in',
            keys.map((key) => tuple(key.teamId, key.meetingType))
          )
        )
        .execute()
      return keys.map(
        (key) =>
          res.find((doc) => doc.teamId === key.teamId && doc.meetingType === key.meetingType)!
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}

export const organizationApprovedDomainsByOrgId = (parent: RootDataLoader) => {
  return new DataLoader<string, string[], string>(
    async (orgIds) => {
      const pg = getKysely()
      const currentApprovals = await pg
        .selectFrom('OrganizationApprovedDomain')
        .selectAll()
        .where('orgId', 'in', orgIds)
        .where('removedAt', 'is', null)
        .execute()
      return orgIds.map((orgId) => {
        return currentApprovals
          .filter((approval) => approval.orgId === orgId)
          .map((approval) => approval.domain)
      })
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const organizationApprovedDomains = (parent: RootDataLoader) => {
  return new DataLoader<string, boolean, string>(
    async (domains) => {
      const pg = getKysely()
      const currentApprovals = await pg
        .selectFrom('OrganizationApprovedDomain')
        .selectAll()
        .where('domain', 'in', domains)
        .where('removedAt', 'is', null)
        .execute()
      return domains.map((domain) => {
        return !!currentApprovals.find((approval) => approval.domain === domain)
      })
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const organizationUsersByUserIdOrgId = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('organizationUsers')
  return new DataLoader<{orgId: string; userId: string}, OrganizationUser | null, string>(
    async (keys) => {
      const pg = getKysely()
      return Promise.all(
        keys.map(async (key) => {
          const {userId, orgId} = key
          if (!userId || !orgId) return null
          const res = await pg
            .selectFrom('OrganizationUser')
            .selectAll()
            .where('userId', '=', userId)
            .where('orgId', '=', orgId)
            .where('removedAt', 'is', null)
            .limit(1)
            .executeTakeFirst()
          return res || null
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.orgId}:${key.userId}`
    }
  )
}

export const meetingTemplatesByType = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('meetingTemplates')
  return new DataLoader<MeetingTemplateKey, MeetingTemplate[], string>(
    async (keys) => {
      const types = {} as Record<MeetingTypeEnum, string[]>
      keys.forEach((key) => {
        const {meetingType} = key
        types[meetingType] = types[meetingType] || []
        types[meetingType]!.push(key.teamId)
      })
      const entries = Object.entries(types) as [MeetingTypeEnum, string[]][]
      const resultsByType = await Promise.all(
        entries.map((entry) => {
          const [meetingType, teamIds] = entry
          const pg = getKysely()
          return pg
            .selectFrom('MeetingTemplate')
            .selectAll()
            .where('teamId', 'in', teamIds)
            .where('isActive', '=', true)
            .where('type', '=', meetingType)
            .execute()
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

export const teamMeetingTemplateByTeamId = (parent: RootDataLoader) => {
  return new DataLoader<string, Selectable<TeamMeetingTemplate>[], string>(
    async (teamIds) => {
      const pg = getKysely()
      const teamMeetingTemplates = await pg
        .selectFrom('TeamMeetingTemplate')
        .selectAll()
        .where('teamId', 'in', teamIds)
        .execute()
      return normalizeArrayResults(teamIds, teamMeetingTemplates, 'teamId')
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const meetingTemplatesByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('meetingTemplates')
  return new DataLoader<string, MeetingTemplate[], string>(
    async (orgIds) => {
      const pg = getKysely()
      const docs = await pg
        .selectFrom('MeetingTemplate')
        .selectAll()
        .where('orgId', 'in', orgIds)
        .where('isActive', '=', true)
        .where(({or, eb}) =>
          or([
            eb('hideStartingAt', 'is', null),
            sql<SqlBool>`DATE '2020-01-01' + EXTRACT(DOY FROM CURRENT_DATE)::INTEGER - 1 between "hideEndingAt" and "hideStartingAt"`,
            sql<SqlBool>`DATE '2019-01-01' + EXTRACT(DOY FROM CURRENT_DATE)::INTEGER - 1 between "hideEndingAt" and "hideStartingAt"`
          ])
        )
        .orderBy('createdAt', 'desc')
        .execute()
      return orgIds.map((orgId) => docs.filter((doc) => doc.orgId === orgId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const meetingTemplatesByTeamId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('meetingTemplates')
  return new DataLoader<string, MeetingTemplate[], string>(
    async (teamIds) => {
      const pg = getKysely()
      const docs = await pg
        .selectFrom('MeetingTemplate')
        .selectAll()
        .where('teamId', 'in', teamIds)
        .where('isActive', '=', true)
        .execute()
      return teamIds.map((teamId) => docs.filter((doc) => doc.teamId === teamId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

type MeetingStat = {
  id: string
  meetingType: MeetingTypeEnum
  createdAt: Date
}

export const meetingStatsByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('newMeetings')
  return new DataLoader<string, MeetingStat[], string>(
    async (orgIds) => {
      const pg = getKysely()
      const meetingStatsByOrgId = await Promise.all(
        orgIds.map(async (orgId) => {
          // note: does not include archived teams!
          const teams = await parent.get('teamsByOrgIds').load(orgId)
          const teamIds = teams.map(({id}) => id)
          const stats = await pg
            .selectFrom('NewMeeting')
            .select(['createdAt', 'meetingType'])
            .where('teamId', 'in', teamIds)
            .execute()
          return stats.map((stat) => ({
            createdAt: stat.createdAt,
            meetingType: stat.meetingType,
            id: `ms${stat.createdAt.getTime()}`
          }))
        })
      )
      return meetingStatsByOrgId
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const teamStatsByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('teams')
  return new DataLoader<string, {id: string; createdAt: Date}[], string>(
    async (orgIds) => {
      const teamStatsByOrgId = await Promise.all(
        orgIds.map(async (orgId) => {
          const teams = await parent.get('teamsByOrgIds').load(orgId)
          return teams.map((team) => ({
            id: `ts:${team.createdAt.getTime()}`,
            createdAt: team.createdAt
          }))
        })
      )
      return teamStatsByOrgId
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const taskIdsByTeamAndGitHubRepo = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('tasks')
  return new DataLoader<{teamId: string; nameWithOwner: string}, string[], string>(
    async (keys) => {
      const res = await Promise.all(
        keys.map(async (key) => {
          const {teamId, nameWithOwner} = key
          const res = await getKysely()
            .selectFrom('Task')
            .select('id')
            .where('teamId', '=', teamId)
            .where('integration', 'is not', null)
            .where(sql<boolean>`"integration"->>'nameWithOwner' = ${nameWithOwner}`)
            .execute()
          return res.map(({id}) => id)
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

export const activeMeetingsByMeetingSeriesId = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('newMeetings')
  return new DataLoader<number, AnyMeeting[], string>(
    async (keys) => {
      const res = await selectNewMeetings()
        .where('meetingSeriesId', 'in', keys)
        .where('endedAt', 'is', null)
        .orderBy('createdAt')
        .execute()
      return normalizeArrayResults(keys, res, 'meetingSeriesId')
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const lastMeetingByMeetingSeriesId = (
  parent: RootDataLoader,
  dependsOn: RegisterDependsOn
) => {
  dependsOn('newMeetings')
  return new DataLoader<number, AnyMeeting | null, string>(
    async (keys) => {
      const meetingIdRes = await getKysely()
        .with('LastMeetings', (qc) =>
          qc
            .selectFrom('NewMeeting')
            .select([
              'id',
              'meetingSeriesId',
              'createdAt',
              sql`ROW_NUMBER() OVER (PARTITION BY "meetingSeriesId" ORDER BY "createdAt" DESC)`.as(
                'rn'
              )
            ])
            .where('meetingSeriesId', 'in', keys)
        )
        .selectFrom('LastMeetings')
        .select('id')
        .where('rn', '=', 1)
        .execute()

      const meetingIds = meetingIdRes.map(({id}) => id)
      const meetings = (await parent.get('newMeetings').loadMany(meetingIds)).filter(isValid)
      return normalizeResults(keys, meetings, 'meetingSeriesId')
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const billingLeadersIdsByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('organizationUsers')
  return new DataLoader<string, string[], string>(
    async (keys) => {
      const pg = getKysely()
      const res = await Promise.all(
        keys.map(async (orgId) => {
          const rows = await pg
            .selectFrom('OrganizationUser')
            .select('userId')
            .where('orgId', '=', orgId)
            .where('removedAt', 'is', null)
            .where('role', 'in', ['BILLING_LEADER', 'ORG_ADMIN'])
            .execute()
          return rows.map((row) => row.userId)
        })
      )
      return res
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const samlByDomain = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('saml')
  return new NullableDataLoader<string, SAMLSource | null, string>(
    async (domains) => {
      const pg = getKysely()
      const res = await pg
        .selectFrom('SAMLDomain')
        .innerJoin('SAML', 'SAML.id', 'SAMLDomain.samlId')
        .where('SAMLDomain.domain', 'in', domains)
        .groupBy('SAML.id')
        .selectAll('SAML')
        .select(({fn}) => [fn.agg<string[]>('array_agg', ['SAMLDomain.domain']).as('domains')])
        .execute()
      // not the same as normalizeResults
      return domains.map((domain) => res.find((row) => row.domains.includes(domain)))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}
export const samlByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('saml')
  return new NullableDataLoader<string, SAMLSource | null, string>(
    async (orgIds) => {
      const pg = getKysely()
      const res = await pg
        .selectFrom('SAMLDomain')
        .innerJoin('SAML', 'SAML.id', 'SAMLDomain.samlId')
        .where('SAML.orgId', 'in', orgIds)
        .groupBy('SAML.id')
        .selectAll('SAML')
        .select(({fn}) => [fn.agg<string[]>('array_agg', ['SAMLDomain.domain']).as('domains')])
        .execute()
      // not the same as normalizeResults
      return orgIds.map((orgId) => res.find((row) => row.orgId === orgId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

// Check if the org has a founder or billing lead with a verified email and their email domain is the same as the org domain
export const isOrgVerified = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('organizationUsers')
  return new DataLoader<string, boolean, string>(
    async (orgIds) => {
      return await Promise.all(
        orgIds.map(async (orgId) => {
          const [organization, orgUsers] = await Promise.all([
            parent.get('organizations').loadNonNull(orgId),
            parent.get('organizationUsersByOrgId').load(orgId)
          ])
          const orgLeaders = orgUsers.filter(
            ({role}) => role && ['BILLING_LEADER', 'ORG_ADMIN'].includes(role)
          )
          const orgLeaderUsers = await Promise.all(
            orgLeaders.map(({userId}) => parent.get('users').loadNonNull(userId))
          )
          const isALeaderVerifiedAtOrgDomain = orgLeaderUsers.some(
            (user) => isUserVerified(user) && user.domain === organization.activeDomain
          )
          if (isALeaderVerifiedAtOrgDomain) return true
          const isOrgSAML = await parent.get('samlByOrgId').load(orgId)
          return !!isOrgSAML
        })
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const autoJoinTeamsByOrgId = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('teams')
  return new DataLoader<string, Team[], string>(
    async (orgIds) => {
      const verificationResults = await parent.get('isOrgVerified').loadMany(orgIds)
      const verifiedOrgIds = orgIds.filter((_, index) => verificationResults[index])

      const teams =
        verifiedOrgIds.length === 0
          ? []
          : await selectTeams()
              .where('orgId', 'in', verifiedOrgIds)
              .where('autoJoin', '=', true)
              .where('isArchived', '!=', true)
              .selectAll()
              .execute()

      return orgIds.map((orgId) => teams.filter((team) => team.orgId === orgId))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

/**
 * Assuming the input is a domain, is it also a company domain?
 */
export const isCompanyDomain = (parent: RootDataLoader) => {
  return new DataLoader<string, boolean, string>(
    async (domains) => {
      const pg = getKysely()
      const res = await pg
        .selectFrom('FreemailDomain')
        .where('domain', 'in', domains)
        .select('domain')
        .execute()
      const freemailDomains = new Set(res.map(({domain}) => domain))
      return domains.map((domain) => !freemailDomains.has(domain))
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const favoriteTemplateIds = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('users')
  return new DataLoader<string, string[], string>(
    async (userIds) => {
      const pg = getKysely()
      const users = await pg
        .selectFrom('User')
        .select(['id', 'favoriteTemplateIds'])
        .where('id', 'in', userIds)
        .execute()

      const userIdToFavoriteTemplateIds = new Map(
        users.map((user) => [user.id, user.favoriteTemplateIds])
      )
      return userIds.map((userId) => userIdToFavoriteTemplateIds.get(userId) || [])
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const fileStoreAsset = (parent: RootDataLoader) => {
  return new DataLoader<string, string, string>(
    async (urls) => {
      // Our cloud saas has a public file store, so no need to make a presigned url
      if (process.env.IS_ENTERPRISE !== 'true') return urls
      const manager = getFileStoreManager()
      const {baseUrl} = manager
      const presignedUrls = await Promise.all(
        urls.map(async (url) => {
          // if the image is not hosted by us, ignore it
          if (!url.startsWith(baseUrl)) return url
          try {
            return await manager.presignUrl(url)
          } catch (e) {
            Logger.log('Unable to presign url', url, e)
            return url
          }
        })
      )
      return presignedUrls
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const meetingCount = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('newMeetings')
  return new DataLoader<{teamId: string; meetingType: MeetingTypeEnum}, number, string>(
    async (keys) => {
      return await Promise.all(
        keys.map(async ({teamId, meetingType}) => {
          const row = await getKysely()
            .selectFrom('NewMeeting')
            .select(({fn}) => fn.count('id').as('count'))
            .where('teamId', '=', teamId)
            .where('meetingType', '=', meetingType)
            .executeTakeFirstOrThrow()
          return Number(row.count)
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.meetingType}`
    }
  )
}

export const latestInsightByTeamId = (parent: RootDataLoader) => {
  return new NullableDataLoader<string, Insight | null, string>(
    async (teamIds) => {
      const pg = getKysely()
      const insights = await pg
        .selectFrom('Insight')
        .where('teamId', 'in', teamIds)
        .selectAll()
        .orderBy('createdAt', 'desc')
        .execute()

      return teamIds.map((teamId) => insights.find((insight) => insight.teamId === teamId) || null)
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

// whether a feature flag is enabled for a given owner (user, team, or org)
export const featureFlagByOwnerId = (parent: RootDataLoader) => {
  return new DataLoader<{ownerId: string; featureName: string}, boolean, string>(
    async (keys) => {
      const pg = getKysely()

      const featureNames = [...new Set(keys.map(({featureName}) => featureName))]
      const ownerIds = [...new Set(keys.map(({ownerId}) => ownerId))]

      if (!__PRODUCTION__) {
        const existingFeatureNames = await pg
          .selectFrom('FeatureFlag')
          .select('featureName')
          .where('featureName', 'in', featureNames)
          .execute()

        const existingFeatureNameSet = new Set(existingFeatureNames.map((row) => row.featureName))

        const missingFeatureNames = featureNames.filter((name) => !existingFeatureNameSet.has(name))
        if (missingFeatureNames.length > 0) {
          Logger.error(
            `Feature flag name(s) not found: ${missingFeatureNames.join(', ')}. Add the feature flag name with the addFeatureFlag mutation.`
          )
        }
      }

      const results = await pg
        .selectFrom('FeatureFlag')
        .innerJoin('FeatureFlagOwner', 'FeatureFlag.id', 'FeatureFlagOwner.featureFlagId')
        .where((eb) =>
          eb.and([
            eb.or([
              eb('FeatureFlagOwner.userId', 'in', ownerIds),
              eb('FeatureFlagOwner.teamId', 'in', ownerIds),
              eb('FeatureFlagOwner.orgId', 'in', ownerIds)
            ]),
            eb('FeatureFlag.featureName', 'in', featureNames),
            eb('FeatureFlag.expiresAt', '>', new Date())
          ])
        )
        .select([
          'FeatureFlagOwner.userId',
          'FeatureFlagOwner.teamId',
          'FeatureFlagOwner.orgId',
          'FeatureFlag.featureName'
        ])
        .execute()

      const featureFlagMap = new Map<string, boolean>()
      results.forEach(({userId, teamId, orgId, featureName}) => {
        const ownerId = userId || teamId || orgId
        featureFlagMap.set(`${ownerId}:${featureName}`, true)
      })

      return keys.map(({ownerId, featureName}) => featureFlagMap.has(`${ownerId}:${featureName}`))
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.ownerId}:${key.featureName}`
    }
  )
}

export const publicTemplatesByType = (parent: RootDataLoader) => {
  const redis = getRedis()
  return new NullableDataLoader<MeetingTypeEnum, MeetingTemplate[], string>(
    async (meetingTypes) => {
      return Promise.all(
        meetingTypes.map(async (type) => {
          const templateType = type === 'poker' ? 'poker' : 'retrospective'
          const redisKey = `publicTemplates:${templateType}`
          const cachedTemplatesStr = await redis.get(redisKey)
          if (cachedTemplatesStr) {
            const cachedTemplates = JSON.parse(cachedTemplatesStr) as MeetingTemplate[]
            cachedTemplates.forEach(
              (meetingTemplate) => (meetingTemplate.createdAt = new Date(meetingTemplate.createdAt))
            )
            return cachedTemplates
          }
          const freshTemplates = await getKysely()
            .selectFrom('MeetingTemplate')
            .selectAll()
            .where('teamId', '=', 'aGhostTeam')
            .where('isActive', '=', true)
            .where('type', '=', templateType)
            .where(({or, eb}) =>
              or([
                eb('hideStartingAt', 'is', null),
                sql<SqlBool>`make_date(2020 , extract(month from current_date)::integer, extract(day from current_date)::integer) between "hideEndingAt" and "hideStartingAt"`,
                sql<SqlBool>`make_date(2019 , extract(month from current_date)::integer, extract(day from current_date)::integer) between "hideEndingAt" and "hideStartingAt"`
              ])
            )
            .orderBy('isFree')
            .execute()
          await redis.setex(redisKey, 60 * 60 * 24, JSON.stringify(freshTemplates))
          return freshTemplates
        })
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export const allFeatureFlags = (parent: RootDataLoader) => {
  return new DataLoader<'Organization' | 'Team' | 'User' | 'all', FeatureFlag[], string>(
    async (scopes) => {
      const pg = getKysely()
      return await Promise.all(
        scopes.map(async (scope) => {
          const flags = await pg
            .selectFrom('FeatureFlag')
            .selectAll()
            .where('expiresAt', '>', new Date())
            .$if(scope !== 'all', (qb) => {
              const validScope = scope as 'Organization' | 'Team' | 'User'
              return qb.where('scope', '=', validScope)
            })
            .orderBy('featureName')
            .execute()
          return flags.map((flag) => ({...flag, isEnabled: true}))
        })
      )
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (scope) => scope
    }
  )
}

export const allFeatureFlagsByOwner = (parent: RootDataLoader) => {
  return new DataLoader<
    {ownerId: string; scope: 'Organization' | 'Team' | 'User'},
    FeatureFlag[],
    string
  >(
    async (keys) => {
      const flagsByOwnerId = await Promise.all(
        keys.map(async ({ownerId, scope}) => {
          const allFlags = await parent.get('allFeatureFlags').load(scope)
          const flags = await Promise.all(
            allFlags.map(async (flag) => {
              const isEnabled = await parent
                .get('featureFlagByOwnerId')
                .load({ownerId, featureName: flag.featureName})
              return {
                ...flag,
                enabled: isEnabled
              }
            })
          )
          return flags
        })
      )

      return flagsByOwnerId
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.ownerId}:${key.scope}`
    }
  )
}
