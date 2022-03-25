import {
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLID
} from 'graphql'
import TeamMember from '../../database/types/TeamMember'
import {GQLContext} from '../graphql'
import IntegrationProviderOAuth1 from './IntegrationProviderOAuth1'
import TeamMemberIntegrationAuthOAuth1 from './TeamMemberIntegrationAuthOAuth1'
import JiraServerRemoteProject from './JiraServerRemoteProject'
import {JiraServerIssueConnection} from './JiraServerIssue'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import sendToSentry from '../../utils/sendToSentry'
import JiraServerTaskIntegrationManager from '../../integrations/JiraServerTaskIntegrationManager'
import {IntegrationProviderJiraServer} from '../../postgres/queries/getIntegrationProvidersByIds'

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
    issues: {
      type: new GraphQLNonNull(JiraServerIssueConnection),
      description:
        'A list of issues coming straight from the jira integration for a specific team member',
      args: {
        first: {
          type: GraphQLInt,
          defaultValue: 100
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        },
        queryString: {
          type: GraphQLString,
          description: 'A string of text to search for, or JQL if isJQL is true'
        },
        isJQL: {
          type: new GraphQLNonNull(GraphQLBoolean),
          description: 'true if the queryString is JQL, else false'
        },
        projectKeyFilters: {
          type: new GraphQLList(new GraphQLNonNull(GraphQLID)),
          descrption:
            'A list of projects to restrict the search to. format is cloudId:projectKey. If null, will search all'
        }
      },
      resolve: async (
        {teamId, userId},
        // {first, queryString, isJQL, projectKeyFilters},
        {first},
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        if (viewerId !== userId) {
          const err = new Error('Cannot access another team members issues')
          standardError(err, {tags: {teamId, userId}, userId: viewerId})
          return connectionFromTasks([], 0, err)
        }

        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})

        if (!auth) {
          return null
        }

        const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

        if (!provider) {
          return null
        }

        const integrationManager = new JiraServerTaskIntegrationManager(
          auth,
          provider as IntegrationProviderJiraServer
        )

        if (!integrationManager) {
          return null
        }

        const api = integrationManager.getApiManager()

        const issueRes = await api.getIssues()

        if (issueRes instanceof Error) {
          sendToSentry(issueRes, {userId, tags: {teamId}})
          return null
        }

        const {issues} = issueRes

        const mappedIssues = issues.map((issue) => {
          return {
            id: issue.id,
            self: issue.self,
            issueKey: issue.key,
            providerId: provider.id,
            descriptionHTML: issue.renderedFields.description,
            ...issue.fields,
            service: 'jiraServer',
            updatedAt: new Date()
          }
        })

        return connectionFromTasks(mappedIssues, first)
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
