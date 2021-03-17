import catchAndLog from '../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByTeamIdQueryParams,
  updateTeamByTeamIdQuery
} from '../../postgres/queries/generated/updateTeamByTeamIdQuery'
import getPg from '../../postgres/getPg'

const updateTeamByTeamId = async (
  teamUpdates: Partial<IUpdateTeamByTeamIdQueryParams>,
  teamId: string
) => {
  await catchAndLog(() =>
    updateTeamByTeamIdQuery.run(
      {
        ...teamUpdates,
        id: teamId
      } as IUpdateTeamByTeamIdQueryParams,
      getPg()
    )
  )
}

export default updateTeamByTeamId
