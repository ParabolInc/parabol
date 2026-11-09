import DataLoader from 'dataloader'
import {sql} from 'kysely'
import type {TaskServiceEnum} from '../graphql/public/resolverTypes'
import getKysely from '../postgres/getKysely'
import type RootDataLoader from './RootDataLoader'

type IntegrationTaskCount = {service: TaskServiceEnum; taskCount: number}

export const recentIntegrationTaskCountsByOrgId = (parent: RootDataLoader) => {
  return new DataLoader<string, IntegrationTaskCount[], string>(
    async (orgIds) => {
      const windowStart = sql<Date>`NOW() - INTERVAL '180 days'`
      const service = sql<TaskServiceEnum>`"Task"."integration"->>'service'`
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
      return orgIds.map((orgId) =>
        rows
          .filter((row) => row.orgId === orgId)
          .map(({service, taskCount}) => ({service, taskCount}))
      )
    },
    {...parent.dataLoaderOptions}
  )
}
