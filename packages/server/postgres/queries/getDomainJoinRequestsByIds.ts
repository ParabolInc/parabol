import getKysely from '../getKysely'

export const getDomainJoinRequestsByIds = async (ids: readonly string[]) => {
  const pg = getKysely()
  return pg.selectFrom('DomainJoinRequest').selectAll().where('id', 'in', ids).execute()
}
