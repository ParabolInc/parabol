import getRethink from '../../../database/rethinkDriver'
import getKysely from '../../../postgres/getKysely'
import {RValue} from '../../../database/stricterR'

export const getExistingOneOnOneTeam = async (
  userId: string,
  secondUserId: string,
  orgId: string
) => {
  const r = await getRethink()
  const pg = getKysely()
  const userIds = [userId, secondUserId]
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
    .getField('group')
    .coerceTo('array')
    .run()

  if (!existingTeamIds.length) {
    return null
  }

  const teams = await pg
    .selectFrom('Team')
    .selectAll()
    .where('id', 'in', existingTeamIds)
    .where('orgId', '=', orgId)
    .where('isOneOnOneTeam', '=', true)
    .where('isArchived', '=', false)
    .execute()

  return teams[0]
}
