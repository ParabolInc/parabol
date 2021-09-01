import {
  IArchiveTeamsByTeamIdsQueryParams,
  archiveTeamsByTeamIdsQuery
} from '../../postgres/queries/generated/archiveTeamsByTeamIdsQuery'
import getPg from '../../postgres/getPg'

const archiveTeamsByTeamIds = async (teamIds: string | string[]) => {
  teamIds = typeof teamIds === 'string' ? [teamIds] : teamIds
  return archiveTeamsByTeamIdsQuery.run(
    {
      ids: teamIds
    } as IArchiveTeamsByTeamIdsQueryParams,
    getPg()
  )
}

export default archiveTeamsByTeamIds
