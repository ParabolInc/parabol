import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import TeamMember from '../../database/types/TeamMember'
import JiraServerRestManager from '../../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../../postgres/queries/getIntegrationProvidersByIds'
import getLatestIntegrationSearchQueries from '../../postgres/queries/getLatestIntegrationSearchQueries'
import {getUserId} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import IntegrationProviderOAuth1 from './IntegrationProviderOAuth1'
import JiraSearchQuery from './JiraSearchQuery'
import {JiraServerIssueConnection} from './JiraServerIssue'
import JiraServerRemoteProject from './JiraServerRemoteProject'
import TeamMemberIntegrationAuthOAuth1 from './TeamMemberIntegrationAuthOAuth1'

type IssueArgs = {
  first: number
  after: string
  queryString: string | null
  isJQL: boolean
  projectKeyFilters: string[] | null
}

const JiraServerIntegration = new GraphQLObjectType<{teamId: string; userId: string}, GQLContext>({
  name: 'JiraServerIntegration',
  description: 'Jira Server integration data for a given team member',
  fields: () => ({
    id: {
      type: GraphQLID,
      description: 'Composite key in jiraServer:providerId format',
      resolve: async ({teamId, userId}: {teamId: string; userId: string}, _args, {dataLoader}) => {
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})

        if (!auth) {
          return null
        }

        return `jiraServer:${auth.providerId}`
      }
    },
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
          defaultValue: 25
        },
        after: {
          type: GraphQLString,
          defaultValue: '0'
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
      resolve: async ({teamId, userId}, args: any, {authToken, dataLoader}) => {
        const {first, after, queryString, isJQL, projectKeyFilters} = args as IssueArgs
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

        const integrationManager = new JiraServerRestManager(
          auth,
          provider as IntegrationProviderJiraServer
        )

        if (!integrationManager) {
          return null
        }

        const projectKeys = (projectKeyFilters ?? []).map(
          (projectKeyFilter) => IntegrationRepoId.split(projectKeyFilter).projectKey!
        )

        // Request one extra item to see if there are more results
        const maxResults = first + 1
        // Relay requires the cursor to be a string
        const afterInt = parseInt(after, 10)
        const startAt = afterInt + 1
        const issueRes = await integrationManager.getIssues(
          queryString,
          isJQL,
          projectKeys,
          maxResults,
          startAt
        )

        if (issueRes instanceof Error) {
          return connectionFromTasks([], first, {
            message: issueRes.message
          })
        }

        const {issues} = issueRes

        const mappedIssues = issues.map((issue) => {
          const {project, issuetype, summary, description} = issue.fields
          return {
            ...issue,
            userId,
            teamId,
            providerId: provider.id,
            issueKey: issue.key,
            descriptionHTML: issue.renderedFields.description,
            projectId: project.id,
            projectKey: project.key,
            issueType: issuetype.id,
            summary,
            description,
            service: 'jiraServer' as const,
            updatedAt: new Date()
          }
        })

        const nodes = mappedIssues.slice(0, first)
        const edges = mappedIssues.map((node, index) => ({
          cursor: `${index + afterInt}`,
          node
        }))

        const firstEdge = edges[0]

        return {
          edges,
          pageInfo: {
            startCursor: firstEdge && firstEdge.cursor,
            endCursor: firstEdge ? edges[edges.length - 1]!.cursor : null,
            hasNextPage: mappedIssues.length > nodes.length
          }
        }
      }
    },
    projects: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JiraServerRemoteProject))),
      description:
        'A list of projects accessible by this team member. empty if viewer is not the user',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('allJiraServerProjects').load({teamId, userId})
      }
    },
    providerId: {
      type: GraphQLInt,
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})

        return auth?.providerId
      }
    },
    searchQueries: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(JiraSearchQuery))),
      description:
        'the list of suggested search queries, sorted by most recent. Guaranteed to be < 60 days old',
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'jiraServer', teamId, userId})

        if (!auth) {
          return []
        }

        const searchQueries = await getLatestIntegrationSearchQueries({
          teamId,
          userId,
          service: 'jiraServer',
          providerId: auth.providerId
        })

        return searchQueries.map((searchQuery) => {
          const query = searchQuery.query as {
            queryString: string | null
            isJQL: boolean
            projectKeyFilters: string[] | null
          }

          return {
            id: searchQuery.id,
            queryString: query.queryString,
            isJQL: query.isJQL,
            projectKeyFilters: query.projectKeyFilters,
            lastUpdatedAt: searchQuery.lastUsedAt
          }
        })
      }
    }
  })
})
export default JiraServerIntegration
