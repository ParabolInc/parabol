import {MattermostIntegrationResolvers} from '../resolverTypes'

export type MattermostIntegrationSource = {
  teamId: string
  userId: string
}

const MattermostIntegration: MattermostIntegrationResolvers = {
  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    const res = await dataLoader
      .get('teamMemberIntegrationAuths')
      .load({service: 'mattermost', teamId, userId})
    return res!
  },

  sharedProviders: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
    const orgTeamIds = orgTeams.map(({id}) => id)
    return dataLoader
      .get('sharedIntegrationProviders')
      .load({service: 'mattermost', orgTeamIds, teamIds: [teamId]})
  }
}

export default MattermostIntegration
