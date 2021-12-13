import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from './generated/updateTeamByTeamIdQuery'
import getPg from '../../postgres/getPg'
import {OptionalExceptFor} from '../../utils/TypeUtil'
import {JiraDimensionField} from './getTeamsByIds'

export interface UpdateTeamParams
  extends OptionalExceptFor<
    Omit<IUpdateTeamByTeamIdQueryParams, 'jiraDimensionFields'>,
    'updatedAt'
  > {
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
