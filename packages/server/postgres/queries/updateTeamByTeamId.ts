import getPg from '../../postgres/getPg'
import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from './generated/updateTeamByTeamIdQuery'
import {JiraDimensionField} from './getTeamsByIds'

export interface UpdateTeamParams
  extends Partial<Omit<IUpdateTeamByTeamIdQueryParams, 'jiraDimensionFields'>> {
  jiraDimensionFields?: JiraDimensionField[]
}

const updateTeamByTeamId = async (teamUpdates: UpdateTeamParams, teamIds: string | string[]) => {
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
