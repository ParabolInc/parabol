import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import GitLabServerManager from '../../integrations/gitlab/GitLabServerManager'
import {GetProjectIssuesQuery} from '../../types/gitlabTypes'
import sendToSentry from '../../utils/sendToSentry'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import fetchGitLabProjects from '../queries/helpers/fetchGitLabProjects'
import GitLabSearchQuery from './GitLabSearchQuery'
import IntegrationProviderOAuth2 from './IntegrationProviderOAuth2'
import RepoIntegration from './RepoIntegration'
import StandardMutationError from './StandardMutationError'
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
  after?: string
  projectsIds: string[] | null
  searchQuery: string
  sort: string
  state: string
  fullPath: string
}
type CursorDetails = {
  fullPath: string
  cursor: string
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
        return dataLoader.get('freshGitlabAuth').load({teamId, userId})
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
          description: 'the stringified cursors for pagination'
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
        const {projectsIds, after = ''} = args as ProjectsIssuesArgs
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
          sendToSentry(new Error('Unable to get GitLab projects in projectsIssues query'), {userId})
          return connectionFromTasks([], 0)
        }
        const projectsFullPaths = new Set<string>()
        projectsData.projects?.edges?.forEach((edge) => {
          if (edge?.node?.fullPath) {
            projectsFullPaths.add(edge?.node?.fullPath)
          }
        })
        let parsedAfter: CursorDetails[] | null
        try {
          parsedAfter = after.length ? JSON.parse(after) : null
        } catch (e) {
          sendToSentry(new Error('Error parsing after'), {userId, tags: {after}})
          return connectionFromTasks([], 0)
        }
        const isValidJSON = parsedAfter?.every(
          (cursorsDetails) =>
            typeof cursorsDetails.cursor === 'string' && typeof cursorsDetails.fullPath === 'string'
        )
        if (isValidJSON === false) {
          sendToSentry(new Error('after arg has an invalid JSON structure'), {
            userId,
            tags: {after}
          })
          return connectionFromTasks([], 0)
        }

        const projectsIssuesPromises = Array.from(projectsFullPaths).map((fullPath) => {
          const after = parsedAfter?.find((cursor) => cursor.fullPath === fullPath)?.cursor ?? ''
          return manager.getProjectIssues({
            ...args,
            fullPath,
            after
          })
        })
        const projectsIssues = [] as ProjectIssueEdge[]
        const errors = [] as Error[]
        let hasNextPage = false
        const endCursor = [] as CursorDetails[]
        const projectsIssuesResponses = await Promise.all(projectsIssuesPromises)
        for (const res of projectsIssuesResponses) {
          const [projectIssuesData, err] = res
          if (err) {
            errors.push(err)
            sendToSentry(err, {userId})
            return
          }
          const {project} = projectIssuesData
          if (!project?.issues) continue
          const {fullPath, issues} = project
          const {edges, pageInfo} = issues
          if (pageInfo.hasNextPage) {
            hasNextPage = true
            const currentCursorDetails = endCursor.find(
              (cursorDetails) => cursorDetails.fullPath === fullPath
            )
            const newCursor = pageInfo.endCursor ?? ''
            if (currentCursorDetails) currentCursorDetails.cursor = newCursor
            else endCursor.push({fullPath, cursor: newCursor})
          }
          edges?.forEach((edge) => {
            if (!edge?.node) return
            const {node, cursor} = edge
            projectsIssues.push({cursor, node})
          })
        }

        const firstEdge = projectsIssues[0]
        const stringifiedEndCursor = JSON.stringify(endCursor)
        return {
          error: errors[0],
          edges: projectsIssues,
          pageInfo: {
            startCursor: firstEdge && firstEdge.cursor,
            endCursor: stringifiedEndCursor,
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
    error: {
      type: StandardMutationError,
      description: 'An error with the connection, if any'
    }
  })
})

export const GitLabProjectIssuesConnection = connectionType
export const GitLabProjectIssuesEdge = edgeType
export default GitLabIntegration
