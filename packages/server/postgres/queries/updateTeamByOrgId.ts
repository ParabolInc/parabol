import getPg from '../../postgres/getPg'
import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../postgres/queries/generated/updateTeamByOrgIdQuery'

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
