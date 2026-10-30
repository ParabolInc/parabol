import DataLoader from 'dataloader'
import ms from 'ms'
import getKysely from '../postgres/getKysely'
import {hasEnoughAttendees} from '../postgres/teamActivityCriteria'
import type {Meetingtypeenum} from '../postgres/types/pg'
import reportMeasures from '../reports/measures/reportMeasures'
import {isPokerImportTask, selectTasks} from '../reports/measures/taskExpressions'
import type {OrgStructure} from '../reports/orgStructure'
import type {ReportMeasureQuery, ReportMeasureResult} from '../reports/reportMeasureTypes'
import {isAnyOf} from '../reports/reportQueries'
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

// When the latest meeting of a type that 2 or more people joined started on any of the teams, whatever the period.
// Every pinned report asks for the same teams, so they share one lookup
export const latestMeetingAtByTeamIds = (parent: RootDataLoader) => {
  return new DataLoader<{teamIds: string[]; meetingType: Meetingtypeenum}, Date | null, string>(
    async (keys) =>
      Promise.all(
        keys.map(async ({teamIds, meetingType}) => {
          if (teamIds.length === 0) return null
          const latest = await getKysely()
            .selectFrom('NewMeeting as m')
            .select('m.createdAt')
            .where('m.teamId', 'in', teamIds)
            .where('m.meetingType', '=', meetingType)
            .where(({ref}) => hasEnoughAttendees(ref('m.id')))
            .orderBy('m.createdAt', 'desc')
            .limit(1)
            .executeTakeFirst()
          return latest?.createdAt ?? null
        })
      ),
    {...parent.dataLoaderOptions, cacheKeyFn: (key) => JSON.stringify(key)}
  )
}

// Leaves out the stories Sprint Poker brings in, which the task measures never count
export const latestTaskAtByTeamIds = (parent: RootDataLoader) => {
  return new DataLoader<string[], Date | null, string>(
    async (keys) =>
      Promise.all(
        keys.map(async (teamIds) => {
          if (teamIds.length === 0) return null
          const latest = await selectTasks()
            .select(({fn}) => fn.max('t.createdAt').as('createdAt'))
            .where((eb) =>
              eb.and([isAnyOf(eb.ref('t.teamId'), teamIds), eb.not(isPokerImportTask())])
            )
            .executeTakeFirst()
          return latest?.createdAt ?? null
        })
      ),
    {...parent.dataLoaderOptions, cacheKeyFn: (key) => JSON.stringify(key)}
  )
}

export interface TeamHealthCheck {
  id: string
  teamId: string
  // when the check's results were revealed, which puts it on the calendar
  endedAt: Date
  templateId: string | null
  templateScope: string | null
  templateName: string | null
}

// Each team's Team Health checks with revealed results, newest first
export const teamHealthChecksByTeamId = (parent: RootDataLoader) => {
  return new DataLoader<string, TeamHealthCheck[], string>(
    async (teamIds) => {
      const meetings = await getKysely()
        .selectFrom('NewMeeting as m')
        .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')
        .select([
          'm.id',
          'm.teamId',
          'm.endedAt',
          'm.templateId',
          'tpl.scope as templateScope',
          'tpl.name as templateName'
        ])
        .where('m.teamId', 'in', teamIds)
        .where('m.meetingType', '=', 'teamHealth')
        .where('m.endedAt', 'is not', null)
        .orderBy('m.endedAt', 'desc')
        .execute()
      return teamIds.map((teamId) =>
        meetings.flatMap(({endedAt, ...check}) =>
          check.teamId === teamId && endedAt ? [{...check, endedAt}] : []
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
