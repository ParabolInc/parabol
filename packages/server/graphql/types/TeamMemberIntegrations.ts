import {GraphQLID, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import TeamMemberIntegrationsId from '../../../client/shared/gqlIds/TeamMemberIntegrationsId'
import {isTeamMember} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import AtlassianIntegration from './AtlassianIntegration'
import AzureDevOpsIntegration from './AzureDevOpsIntegration'
import GitHubIntegration from './GitHubIntegration'
import GitLabIntegration from './GitLabIntegration'
import JiraServerIntegration from './JiraServerIntegration'
import MattermostIntegration from './MattermostIntegration'
import SlackIntegration from './SlackIntegration'

const TeamMemberIntegrations = new GraphQLObjectType<{teamId: string; userId: string}, GQLContext>({
  name: 'TeamMemberIntegrations',
  description: 'All the available integrations available for this team member',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'composite',
      resolve: ({teamId, userId}) => TeamMemberIntegrationsId.join(teamId, userId)
    },
    atlassian: {
      type: AtlassianIntegration,
      description: 'All things associated with an Atlassian integration for a team member',
      resolve: async ({teamId, userId}, _args: unknown, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('freshAtlassianAuth').load({teamId, userId})
      }
    },
    jiraServer: {
      type: new GraphQLNonNull(JiraServerIntegration),
      description: 'All things associated with a Jira Server integration for a team member',
      resolve: (source) => source
    },
    github: {
      type: GitHubIntegration,
      description: 'All things associated with a GitHub integration for a team member',
      resolve: async ({teamId, userId}, _args: unknown, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        return dataLoader.get('githubAuth').load({teamId, userId})
      }
    },
    gitlab: {
      type: new GraphQLNonNull(GitLabIntegration),
      description: 'All things associated with a GitLab integration for a team member',
      resolve: (source) => source
    },
    mattermost: {
      type: new GraphQLNonNull(MattermostIntegration),
      description: 'All things associated with a Mattermost integration for a team member',
      resolve: (source) => source
    },
    slack: {
      type: SlackIntegration,
      description: 'All things associated with a slack integration for a team member',
      resolve: async ({teamId, userId}, _args: unknown, {authToken, dataLoader}) => {
        if (!isTeamMember(authToken, teamId)) return null
        const auths = await dataLoader.get('slackAuthByUserId').load(userId)
        return auths.find((auth) => auth.teamId === teamId)
      }
    },
    azureDevOps: {
      type: new GraphQLNonNull(AzureDevOpsIntegration),
      description: 'All things associated with a A integration for a team member',
      resolve: (source) => source
    }
  })
})

export default TeamMemberIntegrations
