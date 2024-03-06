import {sql} from 'kysely'
import getKysely from '../postgres/getKysely'

const addTeamIdToTMS = async (userId: string, teamId: string) => {
  const pg = getKysely()
  return pg
    .updateTable('User')
    .set({tms: sql`arr_append_uniq("tms", ${teamId})`})
    .where('id', '=', userId)
    .execute()
}

export default addTeamIdToTMS
