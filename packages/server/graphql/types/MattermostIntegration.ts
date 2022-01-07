import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import IntegrationProviderWebhook from './IntegrationProviderWebhook'
import TeamMemberIntegrationAuthWebhook from './TeamMemberIntegrationAuthWebhook'

const MattermostIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'MattermostIntegration',
  description: 'Integration Auth and shared providers available to the team member',
  fields: () => ({
    auth: {
      description: 'The OAuth2 Authorization for this team member',
      type: TeamMemberIntegrationAuthWebhook,
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'mattermost', teamId, userId})
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderWebhook))),
      resolve: async ({userId}, _args, {dataLoader}) => {
        const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
        const teamIds = teamMembers.map(({teamId}) => teamId)
        const orgIds = Array.from(new Set(teamMembers.map(({orgId}) => orgId)))

        const orgTeams = (await dataLoader.get('teamsByOrgIds').loadMany(orgIds))
          .flat()
          .filter(isValid)
        const orgTeamIds = orgTeams.map(({teamId}) => teamId)
        return dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'mattermost', orgTeamIds, teamIds})
      }
    }
  })
})

export default MattermostIntegration
