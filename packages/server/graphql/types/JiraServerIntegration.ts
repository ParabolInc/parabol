import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMember from '../../database/types/TeamMember'
import {GQLContext} from '../graphql'
import IntegrationProviderOAuth1 from './IntegrationProviderOAuth1'
import TeamMemberIntegrationAuthOAuth1 from './TeamMemberIntegrationAuthOAuth1'
import JiraServerRemoteProject from './JiraServerRemoteProject'

const JiraServerIntegration = new GraphQLObjectType<{teamId: string; userId: string}, GQLContext>({
  name: 'JiraServerIntegration',
  description: 'Jira Server integration data for a given team member',
  fields: () => ({
    auth: {
      description: 'The OAuth1 Authorization for this team member',
      type: TeamMemberIntegrationAuthOAuth1,
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})
        return auth
      }
    },
    sharedProviders: {
      description: 'The non-global providers shared with the team or organization',
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(IntegrationProviderOAuth1))),
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
        const teamMember = teamMembers.find(
          (teamMember: TeamMember) => teamMember.teamId === teamId
        )
        if (!teamMember) return []

        const team = await dataLoader.get('teams').loadNonNull(teamMember.teamId)
        const {orgId} = team
        const orgTeams = await dataLoader.get('teamsByOrgIds').load(orgId)
        const orgTeamIds = orgTeams.map(({id}) => id)

        const providers = await dataLoader
          .get('sharedIntegrationProviders')
          .load({service: 'jiraServer', orgTeamIds, teamIds: [teamId]})
        return providers
      }
    },
    projects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JiraServerRemoteProject))),
      description:
        'A list of projects accessible by this team member. empty if viewer is not the user',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('allJiraServerProjects').load({teamId, userId})
      }
    }
  })
})
export default JiraServerIntegration
