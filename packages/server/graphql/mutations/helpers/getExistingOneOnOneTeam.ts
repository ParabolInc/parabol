import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {RValue} from '../../../database/stricterR'

const getExistingExactTeams = async (userIds: string[], orgId: string) => {
  const r = await getRethink()
  const pg = getKysely()
  const existingTeamIds = await (
    r
      .table('TeamMember')
      // Select teams where both users exists
      .getAll(r.args(userIds), {index: 'userId'})
      .filter({isNotRemoved: true}) // Only consider users who are not removed
      .group('teamId') as RValue
  )
    .count()
    .ungroup()
    .filter(r.row('reduction').eq(userIds.length))
    .without('reduction')
    // Get all team members for each team
    .eqJoin('group', r.table('TeamMember'), {index: 'teamId'})
    .zip()
    .group('teamId')
    .pluck('userId')
    .ungroup()
    // Select only teams with exact given number of team members
    .filter((row: RValue) => {
      return row('reduction').count().eq(userIds.length)
    })
    .getField('group')
    .coerceTo('array')
    .run()

  if (!existingTeamIds.length) {
    return []
  }

  return pg
    .selectFrom('Team')
    .selectAll()
    .where('id', 'in', existingTeamIds)
    .where('orgId', '=', orgId)
    .where('isArchived', '=', false)
    .execute()
}

export const getExistingOneOnOneTeam = async (
  userId: string,
  secondUserId: string,
  orgId: string
) => {
  const teams = await getExistingExactTeams([userId, secondUserId], orgId)
  return teams[0]
}
