import DataLoader from 'dataloader'
import {Selectable} from 'kysely'
import getKysely from '../postgres/getKysely'
import {selectTeams} from '../postgres/select'
import type {Team} from '../postgres/types'
import {TeamMeetingTemplate} from '../postgres/types/pg'
import normalizeArrayResults from './normalizeArrayResults'
import NullableDataLoader from './NullableDataLoader'
import RootDataLoader, {RegisterDependsOn} from './RootDataLoader'

export const teamsWithUserSort = (parent: RootDataLoader, dependsOn: RegisterDependsOn) => {
  dependsOn('teams')
  return new NullableDataLoader<
    {teamId: string; userId: string},
    (Team & {sortOrder: string}) | null,
    string
  >(
    async (keys) => {
      const teamsLoader = parent.get('teams')
      const res = await selectTeams()
        .innerJoin('TeamMember', 'Team.id', 'TeamMember.teamId')
        .select(['sortOrder', 'userId'])
        .where(({eb, refTuple, tuple}) =>
          eb(
            refTuple('TeamMember.teamId', 'TeamMember.userId'),
            'in',
            keys.map((key) => tuple(key.teamId, key.userId))
          )
        )
        .execute()
      res.forEach((row) => {
        teamsLoader.clear(row.id).prime(row.id, row)
      })
      return keys.map((key) => {
        const team = res.find(({id, userId}) => id === key.teamId && userId === key.userId)
        return team || null
      })
    },
    {
      ...parent.dataLoaderOptions,
      cacheKeyFn: (key) => `${key.teamId}:${key.userId}`
    }
  )
}

export const teamMeetingTemplateByTeamId = (parent: RootDataLoader) => {
  return new NullableDataLoader<string, Selectable<TeamMeetingTemplate>[], string>(
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
