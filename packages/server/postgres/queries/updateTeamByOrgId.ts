import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../postgres/queries/generated/updateTeamByOrgIdQuery'
import getPg from '../../postgres/getPg'

const updateTeamByOrgId = async (
  teamUpdates: Partial<IUpdateTeamByOrgIdQueryParams>,
  orgId: string
) => {
  return updateTeamByOrgIdQuery.run(
    {
      ...teamUpdates,
      orgId
    } as IUpdateTeamByOrgIdQueryParams,
    getPg()
  )
}

export default updateTeamByOrgId
