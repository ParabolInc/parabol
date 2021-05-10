import catchAndLog from '../../postgres/utils/catchAndLog'
import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../postgres/queries/generated/updateTeamByOrgIdQuery'
import getPg from '../../postgres/getPg'

const updateTeamByOrgId = async (
  teamUpdates: Partial<IUpdateTeamByOrgIdQueryParams>,
  orgId: string
) => {
  await catchAndLog(() =>
    updateTeamByOrgIdQuery.run(
      {
        ...teamUpdates,
        orgId
      } as IUpdateTeamByOrgIdQueryParams,
      getPg()
    )
  )
}

export default updateTeamByOrgId
