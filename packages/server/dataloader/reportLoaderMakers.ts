import DataLoader from 'dataloader'
import {sql} from 'kysely'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import {hasEnoughAttendees} from '../postgres/teamActivityCriteria'
import reportMeasures from '../reports/measures/reportMeasures'
import type {ReportMeasureQuery, ReportMeasureResult} from '../reports/reportMeasureTypes'
import type RootDataLoader from './RootDataLoader'

const STARTER_TEAM_COUNT = 2
const STARTER_MEETING_WINDOW = ms('90d')

export const reportMeasureRows = (parent: RootDataLoader) => {
  return new DataLoader<ReportMeasureQuery, ReportMeasureResult, string>(
    async (queries) =>
      Promise.all(queries.map((query) => reportMeasures[query.measure](query, parent))),
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (query) => JSON.stringify(query)
    }
  )
}

// Starter counts its 2 largest teams that met in the last 90 days, topped up with its largest other teams
export const starterReportTeamIdsByOrgId = (parent: RootDataLoader) => {
  return new DataLoader<string, string[], string>(
    async (orgIds) => {
      const since = new Date(Date.now() - STARTER_MEETING_WINDOW)
      return Promise.all(
        orgIds.map(async (orgId) => {
          const teams = await getKysely()
            .selectFrom('Team')
            .select('Team.id')
            .where('Team.orgId', '=', orgId)
            .where('Team.isArchived', '=', false)
            .orderBy(
              sql`EXISTS (
                SELECT 1 FROM "NewMeeting" AS m
                WHERE m."teamId" = "Team".id AND m."createdAt" >= ${since}
                AND ${hasEnoughAttendees(sql.ref('m.id'))}
              )`,
              'desc'
            )
            .orderBy(
              sql`(SELECT count(*) FROM "TeamMember"
                WHERE "TeamMember"."teamId" = "Team".id AND "TeamMember"."isNotRemoved" = true)`,
              'desc'
            )
            .orderBy('Team.createdAt', 'asc')
            .orderBy('Team.id', 'asc')
            .limit(STARTER_TEAM_COUNT)
            .execute()
          return teams.map(({id}) => id)
        })
      )
    },
    {
      ...parent.dataLoaderOptions
    }
  )
}

export interface TeamHealthCheck {
  id: string
  teamId: string
  // when the check's results were revealed, which puts it on the calendar
  endedAt: Date
}

// Each team's Team Health checks with revealed results, newest first
export const teamHealthChecksByTeamId = (parent: RootDataLoader) => {
  return new DataLoader<string, TeamHealthCheck[], string>(
    async (teamIds) => {
      const meetings = await getKysely()
        .selectFrom('NewMeeting')
        .select(['id', 'teamId', 'endedAt'])
        .where('teamId', 'in', teamIds)
        .where('meetingType', '=', 'teamHealth')
        .where('endedAt', 'is not', null)
        .orderBy('endedAt', 'desc')
        .execute()
      return teamIds.map((teamId) =>
        meetings.flatMap(({id, teamId: checkTeamId, endedAt}) =>
          checkTeamId === teamId && endedAt ? [{id, teamId, endedAt}] : []
        )
      )
    },
    {...parent.dataLoaderOptions}
  )
}
