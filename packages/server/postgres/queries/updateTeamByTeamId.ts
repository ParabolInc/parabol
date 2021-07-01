import catchAndLog from '../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from '../../postgres/queries/generated/updateTeamByTeamIdQuery'
import getPg from '../../postgres/getPg'
import {OptionalExceptFor} from '../../utils/TypeUtil'

const updateTeamByTeamId = async (
  teamUpdates: OptionalExceptFor<IUpdateTeamByTeamIdQueryParams, 'updatedAt'>,
  teamIds: string | string[]
) => {
  teamIds = typeof teamIds === 'string' ? [teamIds] : teamIds
  return await catchAndLog(() =>
    updateTeamByTeamIdQuery.run(
      {
        ...teamUpdates,
        ids: teamIds
      } as IUpdateTeamByTeamIdQueryParams,
      getPg()
    )
  )
}

export default updateTeamByTeamId
