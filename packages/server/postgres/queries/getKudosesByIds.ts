import getKysely from '../../postgres/getKysely'

export const getKudosesByIds = async (kudosIds: number[] | readonly number[]) => {
  const pg = getKysely()
  return pg.selectFrom('Kudoses').selectAll().where('id', 'in', kudosIds).execute()
}
