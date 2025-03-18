import {jsonArrayFrom} from 'kysely/helpers/postgres'
import getKysely from './getKysely'
import {JsonObject} from './types/pg'

export const selectUsers = () =>
  getKysely()
    .selectFrom('User')
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb.selectFrom('TeamMember').select('teamId').where('userId', '=', 'User.id').distinct()
      ).as('tms')
    ])
    .$narrowType<{
      identities: JsonObject[]
    }>()
