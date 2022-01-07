import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import isValid from '../isValid'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import IntegrationTokenOAuth2 from './IntegrationTokenOAuth2'

const GitLabIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabIntegration',
  description: 'Gitlab integration data for a given team member',
  fields: () => ({
    auth: {
      description: 'The OAuth2 Authorization for this team member',
      type: IntegrationTokenOAuth2,
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        return dataLoader.get('integrationTokens').load({service: 'gitlab', teamId, userId})
      }
    },
    cloudProvider: {
      description: 'The cloud provider the team member may choose to integrate with',
      type: new GraphQLNonNull(IntegrationProviderOAuth2),
      resolve: async (_source, _args, {dataLoader}) => {
        const [globalProvider] = await dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'gitlab', orgTeamIds: ['aGhostTeam'], teamIds: []})
        return globalProvider
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderOAuth2))),
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
          .load({service: 'gitlab', orgTeamIds, teamIds})
      }
    }
    // The GitLab schema get injected here as 'api'
  })
})
export default GitLabIntegration
