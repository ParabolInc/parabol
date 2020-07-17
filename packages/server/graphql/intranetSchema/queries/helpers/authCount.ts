import getRethink from '../../../../database/rethinkDriver'

type FilterField = 'createdAt' | 'lastSeenAt'

const authCount = async (
  after: Date | null | undefined,
  isActive: boolean | null | undefined,
  filterField: FilterField
) => {
  const r = await getRethink()
  const activeFilter = isActive ? {inactive: false} : {}
  const afterFilter = after ? (row) => row(filterField).ge(after) : {}
  return r
    .table('User')
    .filter(afterFilter)
    .filter(activeFilter)
    .count()
    .run()
}

export default authCount
