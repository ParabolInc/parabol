import isValid from '../../isValid'
import {UpgradeToTeamTierSuccessResolvers} from '../../private/resolverTypes'

export type UpgradeToTeamTierSuccessSource = {
  orgId: string
  teamIds: string[]
}

const UpgradeToTeamTierSuccess: UpgradeToTeamTierSuccessResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    return teams.filter(isValid)
  }
}

export default UpgradeToTeamTierSuccess
