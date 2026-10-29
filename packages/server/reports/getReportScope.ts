import type {DataLoaderWorker} from '../graphql/graphql'
import {getFeatureTier} from '../graphql/types/helpers/getFeatureTier'
import {isUserBillingLeader} from '../utils/authorization'

export interface ReportScope {
  teams: {id: string; name: string}[]
  ownTeamIds: string[]
  canCountWholeOrg: boolean
  leftOutTeamCount: number
}

interface Options {
  orgId: string
  viewerId: string
  isSuperUser: boolean
  dataLoader: DataLoaderWorker
}

// Billing leaders, org admins and super users get every team; everyone else gets the teams they're on
const getReportScope = async ({
  orgId,
  viewerId,
  isSuperUser,
  dataLoader
}: Options): Promise<ReportScope> => {
  const [organization, orgTeams, isLeader, memberships] = await Promise.all([
    dataLoader.get('organizations').loadNonNull(orgId),
    dataLoader.get('teamsByOrgIds').load(orgId),
    isSuperUser || isUserBillingLeader(viewerId, orgId, dataLoader),
    dataLoader.get('teamMembersByUserId').load(viewerId)
  ])
  const viewerTeamIds = new Set(memberships.map(({teamId}) => teamId))
  const visibleTeams = isLeader ? orgTeams : orgTeams.filter(({id}) => viewerTeamIds.has(id))
  const teams = visibleTeams
    .map(({id, name}) => ({id, name}))
    .sort((a, b) => a.name.localeCompare(b.name))
  const ownTeamIdsOf = (scopeTeams: {id: string}[]) =>
    scopeTeams.map(({id}) => id).filter((id) => viewerTeamIds.has(id))
  if (getFeatureTier(organization) !== 'starter') {
    return {teams, ownTeamIds: ownTeamIdsOf(teams), canCountWholeOrg: isLeader, leftOutTeamCount: 0}
  }
  const starterTeamIds = await dataLoader.get('starterReportTeamIdsByOrgId').load(orgId)
  const starterTeams = teams.filter(({id}) => starterTeamIds.includes(id))
  return {
    teams: starterTeams,
    ownTeamIds: ownTeamIdsOf(starterTeams),
    canCountWholeOrg: false,
    leftOutTeamCount: teams.length - starterTeams.length
  }
}

export default getReportScope
