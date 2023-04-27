import errorFilter from '../../../errorFilter'
import {DataLoaderWorker} from '../../../graphql'

export const getTeamsByOrgIds = async (
  orgIds: string[],
  dataLoader: DataLoaderWorker,
  includeArchived: boolean
) => {
  const teamsByOrgId = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds)).filter(errorFilter)
  const teams = teamsByOrgId.flat()
  return includeArchived ? teams : teams.filter(({isArchived}) => !isArchived)
}
