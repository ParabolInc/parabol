import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import {GetProjectIssuesQuery} from '../../types/gitlabTypes'
import sendToSentry from '../../utils/sendToSentry'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import GitLabSearchQuery from './GitLabSearchQuery'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import PageInfoDateCursor from './PageInfoDateCursor'
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
        },
        projectsIds: {
          type: GraphQLList(GraphQLString),
          description: 'the ids of the projects selected as filters'
        }
      },
      resolve: async ({teamId, userId}: {teamId: string; userId: string}, args, context, info) => {
        const {first, projectsIds} = args
        const {dataLoader} = context
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'gitlab', teamId, userId})
        if (!auth?.accessToken) return []
        const {providerId} = auth
        const provider = await dataLoader.get('integrationProviders').load(providerId)
        if (!provider?.serverBaseUrl) return []
        const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
        if (!projectsIds) return connectionFromTasks([], 0)
        const [projectsData, projectsErr] = await manager.getProjects({
          ids: projectsIds
        })
        if (projectsErr) {
          sendToSentry(new Error('Unable to get GitLab projects in projectIssues query'), {userId})
          return connectionFromTasks([], 0)
        }
        const projectsFullPaths = new Set<string>()
        projectsData.projects?.edges?.forEach((edge) => {
          if (edge?.node?.fullPath) {
            projectsFullPaths.add(edge?.node?.fullPath)
          }
        })
        console.log('🚀  ~ projectsFullPaths', projectsFullPaths)
        // if the user has selected a project filter, keep returning more issues as they scroll down
        // otherwise, show them 50 issues to start with
        const maxIssues = projectsIds ? 10000 : 50
        const projectIssues = [] as ProjectIssueConnection[]
        const errors = [] as Error[]
        let hasNextPage = true

        const projectIssuesPromises = Array.from(projectsFullPaths).map((path) =>
          manager.getProjectIssues({
            fullPath: path,
            first
          })
        )
        const [projectIssuesRes] = await Promise.all(projectIssuesPromises)
        projectIssuesRes?.forEach((res) => {
          if (res instanceof Error || !res) return
          const edges = res.project?.issues?.edges
          edges?.forEach((edge) => {
            if (!edge?.node) return
            const {node} = edge
            projectIssues.push({
              cursor: node.updatedAt || new Date(),
              node
            })
          })
        })

        // for await (const fullPath of Array.from(projectsFullPaths)) {
        //   console.log('🚀  ~ fullPath', {fullPath, proLen: projectIssues.length})
        //   hasNextPage = false
        //   const [res, err] = await manager.getProjectIssues({
        //     fullPath,
        //     first
        //   })
        //   if (err) errors.push(err)
        //   if (res?.project?.issues?.pageInfo.hasNextPage) hasNextPage = true
        //   res?.project?.issues?.edges?.forEach((edge) => {
        //     if (edge?.node && projectIssues.length < maxIssues) {
        //       projectIssues.push({
        //         cursor: edge.node.updatedAt || new Date(),
        //         node: edge.node
        //       })
        //     }
        //   })
        //   if (maxIssues === projectIssues.length) {
        //     console.log('BREWAK')
        //     break
        //   }
        // }
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
