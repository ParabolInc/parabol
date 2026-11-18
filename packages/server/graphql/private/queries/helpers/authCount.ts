import {GraphQLError} from 'graphql'
import getPg from '../../../../postgres/getPg'

const filterFields = ['createdAt', 'lastSeenAt'] as const
type FilterField = (typeof filterFields)[number]

const authCount = async (
  after: Date | null | undefined,
  countOnlyActive: boolean | null | undefined,
  filterField: FilterField
) => {
  // This function is only used internally, but that might change
  if (!filterFields.includes(filterField))
    throw new GraphQLError('Possible SQL injection', {extensions: {code: 'INTERNAL_SERVER_ERROR'}})

  const pg = getPg()

  const count = after
    ? await pg.query(
        `SELECT count(*)::float FROM "User"
         WHERE (NOT $1 OR inactive = FALSE)
         AND "${filterField}" >= $2`,
        [countOnlyActive ?? false, after]
      )
    : await pg.query('SELECT count(*)::float FROM "User" WHERE (NOT $1 OR inactive = FALSE)', [
        countOnlyActive ?? false
      ])

  return count.rows[0].count as number
}

export default authCount
