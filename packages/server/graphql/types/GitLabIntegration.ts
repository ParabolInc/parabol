import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import {GetProjectIssuesQuery} from '../../types/gitlabTypes'
import sendToSentry from '../../utils/sendToSentry'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import fetchGitLabProjects from '../queries/helpers/fetchGitLabProjects'
// import {gitlabIssueArgs} from './../../../client/components/GitLabScopingSearchResultsRoot'
import GitLabSearchQuery from './GitLabSearchQuery'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import PageInfo from './PageInfo'
import RepoIntegration from './RepoIntegration'
import TaskIntegration from './TaskIntegration'
import TeamMemberIntegrationAuthOAuth2 from './TeamMemberIntegrationAuthOAuth2'

type ProjectIssuesRes = NonNullable<NonNullable<GetProjectIssuesQuery['project']>['issues']>
type ProjectIssue = NonNullable<NonNullable<NonNullable<ProjectIssuesRes['edges']>[0]>['node']>
type ProjectIssueEdge = {
  node: ProjectIssue
  cursor: string | Date
}
export type ProjectsIssuesArgs = {
  first: number
  after: string
  projectsIds: string[] | null
  searchQuery: string
  sort: string
  state: string
  fullPath: string
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
    },
    projectsIssues: {
      type: new GraphQLNonNull(GitLabProjectIssuesConnection),
      args: {
        first: {
          type: GraphQLNonNull(GraphQLInt)
        },
        after: {
          type: GraphQLString,
          description: 'the datetime cursor'
        },
        projectsIds: {
          type: GraphQLList(GraphQLString),
          description: 'the ids of the projects selected as filters'
        },
        searchQuery: {
          type: GraphQLNonNull(GraphQLString),
          description: 'the search query that the user enters to filter issues'
        },
        sort: {
          type: GraphQLNonNull(GraphQLString),
          description: 'the sort string that defines the order of the returned issues'
        },
        state: {
          type: GraphQLNonNull(GraphQLString),
          description: 'the state of issues, e.g. opened or closed'
        }
      },
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        args: any,
        context,
        info
      ) => {
        const {first, projectsIds} = args as ProjectsIssuesArgs
        console.log('🚀  ~ args', args)
        const {dataLoader} = context
        const auth = await dataLoader
          .get('teamMemberIntegrationAuths')
          .load({service: 'gitlab', teamId, userId})
        if (!auth?.accessToken) return []
        const {providerId} = auth
        const provider = await dataLoader.get('integrationProviders').load(providerId)
        if (!provider?.serverBaseUrl) return []
        const manager = new GitLabServerManager(auth, context, info, provider.serverBaseUrl)
        const [projectsData, projectsErr] = await manager.getProjects({
          ids: projectsIds,
          first: 50 // if no project filters have been selected, get the 50 most recently used projects
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
        const projectsIssues = [] as ProjectIssueEdge[]
        const errors = [] as Error[]
        let hasNextPage = true
        const cursors = {}

        const projectsIssuesPromises = Array.from(projectsFullPaths).map((fullPath) => {
          const parsed = args.after && JSON.parse(args.after)
          console.log('🚀  ~ parsed', parsed)
          const after = parsed && parsed[fullPath]
          console.log('🚀  ~ after', after)
          // const after =
          //   null && args.after && fullPath === 'parabol1/parabol'
          //     ? 'eyJ1cGRhdGVkX2F0IjoiMjAyMC0xMi0wMiAyMjo0NDozMy4wMDAwMDAwMDAgVVRDIiwiaWQiOiI3NTUyNTEzMCJ9'
          //     : args.after
          // console.log('🚀  ~ after', {after, fullPath})
          return manager.getProjectIssues({
            ...args,
            fullPath,
            after
          })
        })
        const projectsIssuesResponses = await Promise.all(projectsIssuesPromises)
        for (const res of projectsIssuesResponses) {
          const [projectIssuesData, err] = res
          if (err) {
            sendToSentry(err, {userId})
            return
          }
          const fullPath = projectIssuesData.project?.fullPath
          const edges = projectIssuesData.project?.issues?.edges
          edges?.forEach((edge) => {
            if (!edge?.node) return
            const {node} = edge
            // console.log('🚀  ~ node', node)
            if (fullPath) {
              cursors[fullPath] = edge.cursor
            }

            // if the last item in projectsIssues doesn't have the same projectId, add the fullPath
            // and cursor to a cursors obj

            projectsIssues.push({
              // cursor: new Date(),
              // cursor: node.updatedAt || new Date(),
              cursor: edge?.cursor || new Date(),
              node
            })
          })
        }

        const firstEdge = projectsIssues[0]
        // console.log('🚀  ~ projectsIssues len', {len: projectsIssues.length, firstEdge})
        // let endCursor
        // if (firstEdge) {
        //   // console.log('got the first edge', projectsIssues.at(-1)!.cursor)
        //   endCursor = projectsIssues.at(-1)!.cursor
        // } else {
        //   // console.log('NOOOP NEW DATE plz', new Date())
        //   endCursor = new Date()
        // }

        // const cursors = {} as {[fullPath: string]: string}
        // const vals = Array.from(projectsFullPaths).map((projectFullPath) => {
        //   for (let i = projectsIssues.length - 1; i >= 0; i--) {
        //     const webPath = projectsIssues[i]?.node.webPath
        //     const webUrl = projectsIssues[i]?.node.webUrl
        //     if (!webPath) return
        //     const {fullPath} = parseWebPath(webPath)
        //     // console.log('🚀  ~ fullPath', {fullPath, projectFullPath, webPath, webUrl})
        //     const cursor = projectsIssues[i]?.cursor as string
        //     if (fullPath === projectFullPath && !cursors[fullPath] && cursor) {
        //       cursors[fullPath] = cursor
        //     }
        //   }
        // })
        const stringifiedEndCursors = JSON.stringify(cursors)
        console.log('🚀  ~ cursors', {cursors, stringifiedEndCursors})

        return {
          error: errors,
          edges: projectsIssues,
          pageInfo: {
            startCursor: firstEdge && firstEdge.cursor,
            endCursor: stringifiedEndCursors,
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
      type: GraphQLString
    }
  }),
  connectionFields: () => ({
    pageInfo: {
      type: PageInfo,
      description: 'Page info with cursors coerced to ISO8601 dates'
    }
  })
})

export const GitLabProjectIssuesConnection = connectionType
export const GitLabProjectIssuesEdge = edgeType
export default GitLabIntegration
