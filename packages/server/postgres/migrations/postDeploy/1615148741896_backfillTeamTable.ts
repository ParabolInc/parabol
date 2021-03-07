/* eslint-disable @typescript-eslint/camelcase */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import getRethink from '../../../database/rethinkDriver'
import catchAndLog from '../../utils/catchAndLog'
import getPg from '../../getPg'
import Team from '../../../database/types/Team'
import {IBackupTeamQueryParams, backupTeamQuery} from '../../queries/generated/backupTeamQuery'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'

const undefinedTeamFieldsAndTheirDefaultValues = {
  jiraDimensionFields: []
}

const cleanTeams = (teams: Team[]): IBackupTeamQueryParams['teams'] => {
  const cleanedTeams = []
  teams.forEach(team => {
    const cleanedTeam = Object.assign(
      {},
      undefinedTeamFieldsAndTheirDefaultValues,
      team,
      {
        lastMeetingType: team.lastMeetingType ?? MeetingTypeEnum.retrospective,
        updatedAt: team.updatedAt ?? new Date(),
        jiraDimensionFields: team.jiraDimensionFields ?? [],
        name: team.name.slice(0, 100)
      }
    )
    cleanedTeams.push(cleanedTeam)
  })
  return cleanedTeams as IBackupTeamQueryParams['teams']
}

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()
  const batchSize = 3000 // doing 4000 or 5000 results in error relating to size of parameterized query
  const backfillStartTs = new Date()
  console.log('start ts:', backfillStartTs)
  // todo: make `doBackfill` generic and reusable
  const doBackfill = async (
    teamsByFieldChoice: ('createdAt' | 'updatedAt'),
    teamsAfterTs?: Date
  ) => {
    let i = 0
    let foundTeams = false

    console.log('starting backfill pass...')
    console.log('after ts:', teamsAfterTs, 'by:', teamsByFieldChoice)
    while (true) {
      console.log('i:', i)
      const offset = batchSize * i
      const rethinkTeams = await r.db('actionProduction')
        .table('Team')
        // todo: index on createdAt and updatedAt team fields
        .between(teamsAfterTs ?? r.minval, r.maxval, {index: teamsByFieldChoice})
        .orderBy(teamsByFieldChoice, {index: teamsByFieldChoice})
        .skip(offset)
        .limit(batchSize)
        .run()
      if (!rethinkTeams.length) { break }
      foundTeams = true
      const pgTeams = cleanTeams(rethinkTeams)
      await catchAndLog(() => backupTeamQuery.run({teams: pgTeams}, getPg()))
      i += 1
    }
    return foundTeams
  }
  // todo: make `doBackfillAccountingForRaceConditions` generic and reusable
  const doBackfillAccountingForRaceConditions = async (
    teamsByFieldChoice: ('createdAt' | 'updatedAt'),
    teamsAfterTs?: Date
  ) => {
    while (true) {
      const thisBackfillStartTs = new Date()
      const backfillFoundTeams = await doBackfill(
        teamsByFieldChoice,
        teamsAfterTs
      )
      console.log('backfillFoundTeams?', backfillFoundTeams)
      // await new Promise(resolve => setTimeout(resolve, 1000*60*2)) // update team while sleeping
      if (!backfillFoundTeams) { break }
      teamsAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions('createdAt')
  await doBackfillAccountingForRaceConditions('updatedAt', backfillStartTs)
  await r.getPoolMaster().drain()
  console.log('finished')
}

export async function down(pgm: MigrationBuilder): Promise<void> {
}
