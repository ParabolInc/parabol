import {MsTeamsIntegrationResolvers} from '../resolverTypes'

export type MSTeamsIntegrationSource = {
  teamId: string
  userId: string
}

const MSTeamsIntegration: MsTeamsIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMemberIntegrationAuths').load({service: 'msTeams', teamId, userId})
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const orgTeamIds = orgTeams.map(({id}) => id)
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'msTeams', orgTeamIds, teamIds: [teamId]})
  }
}

export default MSTeamsIntegration
