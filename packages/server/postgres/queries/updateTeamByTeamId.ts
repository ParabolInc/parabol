import getPg from '../../postgres/getPg'
import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from './generated/updateTeamByTeamIdQuery'

const updateTeamByTeamId = async (
  teamUpdates: Partial<Omit<IUpdateTeamByTeamIdQueryParams, 'jiraDimensionFields'>>,
  teamIds: string | string[]
) => {
  teamIds = typeof teamIds === 'string' ? [teamIds] : teamIds
  return updateTeamByTeamIdQuery.run(
    {
      ...teamUpdates,
      ids: teamIds
    } as any,
    getPg()
  )
}

export default updateTeamByTeamId
