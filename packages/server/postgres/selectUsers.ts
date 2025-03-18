import getKysely from './getKysely'
import {JsonObject} from './types/pg'

export const selectUsers = () =>
  getKysely().selectFrom('User')
    .selectAll()
    .select((eb) => [
        eb.selectFrom('TeamMember').select(({fn}) => fn.agg('array_agg', ['teamId']).as('tm')).whereRef('userId', '=', 'User.id').distinct().as('tms')
    ])
    .$narrowType<{
      identities: JsonObject[]
    }>()
