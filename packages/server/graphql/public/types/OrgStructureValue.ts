import {type OrgStructureValueSource, toOrgStructureKey} from '../../../reports/orgStructure'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import type {OrgStructureValueResolvers} from '../resolverTypes'

export type {OrgStructureValueSource}

const OrgStructureValue: OrgStructureValueResolvers = {
  id: ({id}) => toOrgStructureKey(id, 'OrgStructureValue'),
  level: async ({orgId, levelId}, _args, {dataLoader}) => {
    const {levels} = await dataLoader.get('orgStructureByOrgId').load(orgId)
    return levels.find(({id}) => id === levelId)!
  },
  // the same teams the organization's team list shows the viewer
  teams: async ({id, orgId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const [{placements}, teams, isLeader] = await Promise.all([
      dataLoader.get('orgStructureByOrgId').load(orgId),
      dataLoader.get('teamsByOrgIds').load(orgId),
      isSuperUser(authToken) || isUserBillingLeader(viewerId, orgId, dataLoader)
    ])
    const placedTeamIds = new Set(
      placements.filter(({valueId}) => valueId === id).map(({teamId}) => teamId)
    )
    return teams.filter(
      (team) =>
        placedTeamIds.has(team.id) && (isLeader || team.isPublic || authToken.tms.includes(team.id))
    )
  }
}

export default OrgStructureValue
