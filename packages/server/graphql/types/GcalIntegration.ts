import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

const GcalIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GcalIntegration',
  description: 'Integration Auth and shared providers available to the team member',
  fields: () => ({
    auth: {
      description: 'The Webhook Authorization for this team member',
      type: TeamMemberIntegrationAuthOAuth2,
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return dataLoader.get('teamMemberIntegrationAuths').load({service: 'gcal', teamId, userId})
      }
    },
    cloudProvider: {
      description:
        'The cloud provider the team member may choose to integrate with. Nullable based on env vars',
      type: IntegrationProviderOAuth2,
      resolve: async (_source: unknown, _args: unknown, {dataLoader}) => {
        const [globalProvider] = await dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'gcal', orgTeamIds: ['aGhostTeam'], teamIds: []})
        return globalProvider
      }
    }
  })
})

export default GcalIntegration
