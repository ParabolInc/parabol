import DataLoader from 'dataloader'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import {hasEnoughAttendees} from '../postgres/teamActivityCriteria'
import reportMeasures from '../reports/measures/reportMeasures'
import type {OrgStructure} from '../reports/orgStructure'
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
              ({exists, selectFrom}) =>
                exists(
                  selectFrom('NewMeeting as m')
                    .select(({lit}) => lit(1).as('met'))
                    .whereRef('m.teamId', '=', 'Team.id')
                    .where('m.createdAt', '>=', since)
                    .where(({ref}) => hasEnoughAttendees(ref('m.id')))
                ),
              'desc'
            )
            .orderBy(
              ({selectFrom}) =>
                selectFrom('TeamMember')
                  .select(({fn}) => fn.countAll().as('memberCount'))
                  .whereRef('TeamMember.teamId', '=', 'Team.id')
                  .where('TeamMember.isNotRemoved', '=', true),
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

// Each org's org structure: its levels in order with their values, and where its teams sit
export const orgStructureByOrgId = (parent: RootDataLoader) => {
  return new DataLoader<string, OrgStructure, string>(
    async (orgIds) => {
      const pg = getKysely()
      const levels = await pg
        .selectFrom('OrgStructureLevel')
        .selectAll()
        .where('orgId', 'in', orgIds)
        .orderBy('sortOrder')
        .orderBy('id')
        .execute()
      const levelIds = levels.map(({id}) => id)
      const [values, placements] =
        levelIds.length === 0
          ? [[], []]
          : await Promise.all([
              pg
                .selectFrom('OrgStructureValue')
                .selectAll()
                .where('levelId', 'in', levelIds)
                .orderBy('sortOrder')
                .orderBy('id')
                .execute(),
              pg
                .selectFrom('OrgStructurePlacement')
                .selectAll()
                .where('levelId', 'in', levelIds)
                .execute()
            ])
      return orgIds.map((orgId) => {
        const orgLevels = levels
          .filter((level) => level.orgId === orgId)
          .map(({id, name}) => ({
            id,
            orgId,
            name,
            values: values
              .filter((value) => value.levelId === id)
              .map((value) => ({id: value.id, orgId, levelId: id, name: value.name}))
          }))
        const orgLevelIds = new Set(orgLevels.map(({id}) => id))
        return {
          levels: orgLevels,
          placements: placements
            .filter(({levelId}) => orgLevelIds.has(levelId))
            .map(({teamId, levelId, valueId}) => ({teamId, levelId, valueId}))
        }
      })
    },
    {...parent.dataLoaderOptions}
  )
}
