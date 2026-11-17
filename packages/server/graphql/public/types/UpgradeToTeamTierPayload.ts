import isValid from '../../isValid'
import type {UpgradeToTeamTierPayloadResolvers} from '../../private/resolverTypes'

export type UpgradeToTeamTierPayloadSource = {
  orgId: string
  teamIds: string[]
}

const UpgradeToTeamTierPayload: UpgradeToTeamTierPayloadResolvers = {
  organization: async ({orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizations').loadNonNull(orgId)
  },
  teams: async ({teamIds}, _args, {dataLoader}) => {
    const teams = await dataLoader.get('teams').loadMany(teamIds)
    return teams.filter(isValid)
  }
}

export default UpgradeToTeamTierPayload
