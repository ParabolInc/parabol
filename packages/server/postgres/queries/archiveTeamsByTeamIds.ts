import getPg from '../../postgres/getPg'
import {
  archiveTeamsByTeamIdsQuery,
  IArchiveTeamsByTeamIdsQueryParams
} from '../../postgres/queries/generated/archiveTeamsByTeamIdsQuery'

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
