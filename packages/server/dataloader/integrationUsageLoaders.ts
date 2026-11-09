import DataLoader from 'dataloader'
import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'
import type RootDataLoader from './RootDataLoader'

type TaskCountsByService = Record<string, number>

export const recentIntegrationTaskCountsByOrgId = (parent: RootDataLoader) => {
  return new DataLoader<string, TaskCountsByService, string>(
    async (orgIds) => {
      const windowStart = sql<Date>`NOW() - INTERVAL '180 days'`
      const service = sql<string>`"Task"."integration"->>'service'`
      const rows = await getKysely()
        .selectFrom('Task')
        .innerJoin('Team', 'Team.id', 'Task.teamId')
        .select(['Team.orgId', service.as('service'), sql<number>`COUNT(*)::int`.as('taskCount')])
        .where('Team.orgId', 'in', orgIds)
        .where('Team.isArchived', '=', false)
        .where('Task.integration', 'is not', null)
        .where('Task.createdAt', '>', windowStart)
        // updatedAt is never before createdAt, and this lets the teamId + updatedAt index narrow the scan
        .where('Task.updatedAt', '>', windowStart)
        .groupBy(['Team.orgId', service])
        .execute()
      const countsByOrgId = new Map<string, TaskCountsByService>()
      rows.forEach(({orgId, service, taskCount}) => {
        countsByOrgId.set(orgId, {...countsByOrgId.get(orgId), [service]: taskCount})
      })
      return orgIds.map((orgId) => countsByOrgId.get(orgId) ?? {})
    },
    {...parent.dataLoaderOptions}
  )
}
