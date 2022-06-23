import {ColumnDefinitions, MigrationBuilder} from 'node-pg-migrate'
import {MeetingTypeEnum} from 'parabol-client/types/graphql'
import getRethink from '../../../database/rethinkDriver'
import Team from '../../../database/types/Team'
import {TEAM_NAME_LIMIT} from '../../constants'
import {backupTeamQuery} from '../../generatedMigrationHelpers'
import getPg from '../../getPg'
import catchAndLog from '../../utils/catchAndLog'

const undefinedTeamFieldsAndTheirDefaultValues = {
  jiraDimensionFields: [],
  isOnboardTeam: false
}

const cleanTeams = (teams: Team[]) => {
  const cleanedTeams = []
  teams.forEach((team) => {
    const cleanedTeam = Object.assign({}, undefinedTeamFieldsAndTheirDefaultValues, team, {
      lastMeetingType: team.lastMeetingType ?? MeetingTypeEnum.retrospective,
      updatedAt: team.updatedAt ?? new Date(),
      jiraDimensionFields: team.jiraDimensionFields ?? [],
      name: team.name.slice(0, TEAM_NAME_LIMIT)
    })
    cleanedTeams.push(cleanedTeam)
  })
  return cleanedTeams as any
}

export const shorthands: ColumnDefinitions | undefined = undefined

export async function up(pgm: MigrationBuilder): Promise<void> {
  const r = await getRethink()

  // no backfill if Team table was dropped already
  if (!(await r.tableList().contains('Team').run())) return

  const epochTimeOfEvent = 1616716368.188
  const batchSize = 1000

  const doBackfill = async (teamsAfterTs?: Date) => {
    let i = 0
    let foundTeams = false

    while (true) {
      const offset = batchSize * i
      const rethinkTeams = await r
        .table('Team')
        .between(teamsAfterTs ?? r.minval, r.maxval, {index: 'updatedAt'})
        .filter((row) =>
          // grab all teams "created" (artificially) at that timestamp,
          // 1 second before & after to cover all teams affected
          r.and(
            row('createdAt').ge(r.epochTime(epochTimeOfEvent - 1)),
            row('createdAt').le(r.epochTime(epochTimeOfEvent + 1))
          )
        )
        .skip(offset)
        .limit(batchSize)
        .run()
      console.log(`Backfilling ${rethinkTeams.length} team(s).`)

      if (rethinkTeams.length) {
        foundTeams = true
        const pgTeams = cleanTeams(rethinkTeams)
        await catchAndLog(() => backupTeamQuery.run({teams: pgTeams}, getPg()))
        i += 1
      } else {
        break
      }
    }
    return foundTeams
  }

  const doBackfillAccountingForRaceConditions = async (teamsAfterTs?: Date) => {
    while (true) {
      const thisBackfillStartTs = new Date()
      const backfillFoundTeams = await doBackfill(teamsAfterTs)
      if (!backfillFoundTeams) {
        break
      }
      teamsAfterTs = thisBackfillStartTs
    }
  }

  await doBackfillAccountingForRaceConditions()
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // noop
}
