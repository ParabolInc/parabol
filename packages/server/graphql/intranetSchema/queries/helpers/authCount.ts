import getRethink from '../../../../database/rethinkDriver'

type FilterField = 'createdAt' | 'lastSeenAt'

const authCount = async (
  after: Date | null | undefined,
  isActive: boolean | null | undefined,
  filterField: FilterField
) => {
  const r = await getRethink()
  const activeFilter = isActive ? {inactive: false} : {}
  return r
    .table('User')
    .between(after || r.minval, r.maxval, {index: filterField})
    .filter(activeFilter)
    .count()
    .run()
}

export default authCount
