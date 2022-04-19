import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import fetchGitLabProjects from '../queries/helpers/fetchGitLabProjects'
import GitLabSearchQuery from './GitLabSearchQuery'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import RepoIntegration from './RepoIntegration'
import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

const GitLabIntegration = new GraphQLObjectType<any, GQLContext>({
  name: 'GitLabIntegration',
  description: 'Gitlab integration data for a given team member',
  fields: () => ({
    auth: {
      description: 'The OAuth2 Authorization for this team member',
      type: TeamMemberIntegrationAuthOAuth2,
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        _args: unknown,
        {dataLoader}
      ) => {
        return dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'gitlab', teamId, userId})
      }
    },
    cloudProvider: {
      description:
        'The cloud provider the team member may choose to integrate with. Nullable based on env vars',
      type: IntegrationProviderOAuth2,
      resolve: async (_source: unknown, _args: unknown, {dataLoader}) => {
        const [globalProvider] = await dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'gitlab', orgTeamIds: ['aGhostTeam'], teamIds: []})
        return globalProvider
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderOAuth2))),
      resolve: async ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        const team = await dataLoader.get('teams').loadNonNull(teamId)
        const {orgId} = team
        const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
        const orgTeamIds = orgTeams.map(({id}) => id)
        return dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'gitlab', orgTeamIds, teamIds: [teamId]})
      }
    },
    gitlabSearchQueries: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GitLabSearchQuery))),
      resolve: async () => []
    },
    projects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RepoIntegration))),
      description: 'A list of projects accessible by this team member',
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        _args: unknown,
        context,
        info
      ) => {
        return fetchGitLabProjects(teamId, userId, context, info)
      }
    }
    // The GitLab schema get injected here as 'api'
  })
})
export default GitLabIntegration
