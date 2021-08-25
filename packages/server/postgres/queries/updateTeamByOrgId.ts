import {
  IUpdateTeamByOrgIdQueryParams,
  updateTeamByOrgIdQuery
} from '../../postgres/queries/generated/updateTeamByOrgIdQuery'
import getPg from '../../postgres/getPg'
import {OptionalExceptFor} from '../../utils/TypeUtil'

const updateTeamByOrgId = async (
  teamUpdates: OptionalExceptFor<IUpdateTeamByOrgIdQueryParams, 'updatedAt'>,
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
