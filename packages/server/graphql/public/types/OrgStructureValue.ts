import {type OrgStructureValueSource, toOrgStructureId} from '../../../reports/orgStructure'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import type {OrgStructureValueResolvers} from '../resolverTypes'

export type {OrgStructureValueSource}

const OrgStructureValue: OrgStructureValueResolvers = {
  id: ({id}) => toOrgStructureId(id, 'OrgStructureValue'),
  // the same teams the organization's team list shows the viewer
  teamIds: async ({id, orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const [{placements}, teams, isLeader] = await Promise.all([
      dataLoader.get('orgStructureByOrgId').load(orgId),
      dataLoader.get('teamsByOrgIds').load(orgId),
      isSuperUser(authToken) || isUserBillingLeader(viewerId, orgId, dataLoader)
    ])
    const visibleTeamIds = new Set(
      teams
        .filter((team) => isLeader || team.isPublic || authToken.tms.includes(team.id))
        .map((team) => team.id)
    )
    return placements
      .filter((placement) => placement.valueId === id && visibleTeamIds.has(placement.teamId))
      .map(({teamId}) => teamId)
  }
}

export default OrgStructureValue
