import {MsTeamsIntegrationResolvers} from '../resolverTypes'

export type MSTeamsIntegrationSource = {
  teamId: string
  userId: string
}

const MSTeamsIntegration: MsTeamsIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'msTeams', teamId, userId})
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'msTeams', orgIds: [orgId], teamIds: [teamId]})
  }
}

export default MSTeamsIntegration
