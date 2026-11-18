import {sql} from 'kysely'
import getKysely from '../../../../../postgres/getKysely'

export const reservePageIds = async (count: number) => {
  const {rows} = await sql<{id: number}>`
    SELECT nextval(pg_get_serial_sequence('"Page"', 'id'))::int AS id
    FROM generate_series(1, ${count})
  `.execute(getKysely())
  return rows.map(({id}) => id)
}
