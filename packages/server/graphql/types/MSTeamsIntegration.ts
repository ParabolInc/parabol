import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import IntegrationProviderWebhook from './IntegrationProviderWebhook'
import TeamMemberIntegrationAuthWebhook from './TeamMemberIntegrationAuthWebhook'

const MSTeamsIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'MSTeamsIntegration',
  description: 'Integration Auth and shared providers available to the team member',
  fields: () => ({
    auth: {
      description: 'The OAuth2 Authorization for this team member',
      type: TeamMemberIntegrationAuthWebhook,
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'msTeams', teamId, userId})
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderWebhook))),
      resolve: async (
        {teamId}: {teamId: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const team = await dataLoader.get('teams').load(teamId)
        if (!team) return standardError(new Error('Team not found'), {userId: viewerId})
        const {orgId} = team
        const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
        const orgTeamIds = orgTeams.map(({id}) => id)
        return dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'msTeams', orgTeamIds, teamIds: [teamId]})
      }
    }
  })
})

export default MSTeamsIntegration
