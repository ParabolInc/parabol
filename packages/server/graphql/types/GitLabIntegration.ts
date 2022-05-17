import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import {GetProjectIssuesQuery} from '../../types/gitlabTypes'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import fetchGitLabProjects from '../queries/helpers/fetchGitLabProjects'
import GitLabSearchQuery from './GitLabSearchQuery'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import PageInfoDateCursor from './PageInfoDateCursor'
import RepoIntegration from './RepoIntegration'
import TaskIntegration from './TaskIntegration'
import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

type ProjectIssuesRes = NonNullable<NonNullable<GetProjectIssuesQuery['project']>['issues']>
type ProjectIssue = NonNullable<NonNullable<NonNullable<ProjectIssuesRes['edges']>[0]>['node']>
type ProjectIssueConnection = {
  node: ProjectIssue
  cursor: string | Date
}

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
    projectIssues: {
      type: new GraphQLNonNull(GitLabProjectIssuesConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async (source, {first}, context, info) => {
        // TODO: add types
        const {dataLoader} = context
        const {teamId, userId} = source
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'gitlab', teamId, userId})
        if (!auth?.accessToken) return []
        const {providerId} = auth
        const provider = await dataLoader.get('integrationProviders').load(providerId)
        if (!provider?.serverBaseUrl) return []
        const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
        const projectIssues = [] as ProjectIssueConnection[]
        const errors = [] as Error[]
        let hasNextPage = true
        for await (const fullPath of ['nick460/no-issue-project']) {
          hasNextPage = false
          const [res, err] = await manager.getProjectIssues({
            fullPath,
            first
          })
          if (err) errors.push(err)
          console.log('🚀  ~ res?.project?.issues?.pageInfo', {
            first,
            pageInfo: res?.project?.issues?.pageInfo
          })
          if (res?.project?.issues?.pageInfo.hasNextPage) hasNextPage = true
          res?.project?.issues?.edges?.forEach((edge) => {
            if (edge?.node) {
              projectIssues.push({
                cursor: edge.node.updatedAt || new Date(),
                node: edge.node
              })
            }
          })
        }
        console.log('🚀  ~ hasNextPage', hasNextPage)
        const firstEdge = projectIssues[0]
        return {
          error: errors,
          edges: projectIssues,
          pageInfo: {
            startCursor: firstEdge && firstEdge.cursor,
            endCursor: firstEdge ? projectIssues.at(-1)!.cursor : new Date(),
            hasNextPage
          }
        }
      }
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

const {connectionType, edgeType} = connectionDefinitions({
  name: GitLabIntegration.name,
  nodeType: TaskIntegration,
  edgeFields: () => ({
    cursor: {
      type: GraphQLISO8601Type
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfoDateCursor,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const GitLabProjectIssuesConnection = connectionType
export const GitLabProjectIssuesEdge = edgeType
export default GitLabIntegration
