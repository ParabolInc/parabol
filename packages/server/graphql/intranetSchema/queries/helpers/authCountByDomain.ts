import getRethink from '../../../../database/rethinkDriver'

type FilterField = 'createdAt' | 'lastSeenAt'
const authCountByDomain = async (
  after: Date | null | undefined,
  isActive: boolean | null | undefined,
  filterField: FilterField
) => {
  const r = await getRethink()
  const activeFilter = isActive ? {inactive: false} : {}
  const afterFilter = after ? (row) => row(filterField).ge(after) : {}

  return r
    .table('User')
    .filter(activeFilter)
    .filter(afterFilter)
    .merge((user) => ({
      domain: user('email')
        .split('@')(1)
        .default(null)
    }))
    .group('domain')
    .count()
    .ungroup()
    .map((row) => ({domain: row('group'), total: row('reduction')}))
    .orderBy(r.desc('total'))
    .run()
}

export default authCountByDomain
