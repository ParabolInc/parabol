import IntegrationProviderId from '~/shared/gqlIds/IntegrationProviderId'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import JiraServerRestManager from '../../../integrations/jiraServer/JiraServerRestManager'
import {IntegrationProviderJiraServer} from '../../../postgres/queries/getIntegrationProvidersByIds'
import getLatestIntegrationSearchQueries from '../../../postgres/queries/getLatestIntegrationSearchQueries'
import {TeamMember} from '../../../postgres/types'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {JiraServerIntegrationResolvers} from '../resolverTypes'

export type JiraServerIntegrationSource = {
  teamId: string
  userId: string
}
type IssueArgs = {
  first: number
  after: string
  queryString: string | null
  isJQL: boolean
  projectKeyFilters: string[] | null
}

const JiraServerIntegration: JiraServerIntegrationResolvers = {
  id: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})

    if (!auth) {
      return null
    }

    return `jiraServer:${teamId}:${auth.providerId}`
  },

  auth: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})
    return auth!
  },

  sharedProviders: async ({teamId, userId}, _args, {dataLoader}) => {
    const teamMembers = await dataLoader.get('teamMembersByUserId').load(userId)
    const teamMember = teamMembers.find((teamMember: TeamMember) => teamMember.teamId === teamId)
    if (!teamMember) return []

    const team = await dataLoader.get('teams').loadNonNull(teamMember.teamId)
    const {orgId} = team

    const providers = await dataLoader.get('sharedIntegrationProviders').load({
      service: 'jiraServer',
      orgIds: [orgId],
      teamIds: [teamId]
    })

    return providers
  },

  issues: async ({teamId, userId}, args, {authToken, dataLoader}) => {
    const {first, after, queryString, isJQL, projectKeyFilters} = args as IssueArgs
    const viewerId = getUserId(authToken)
    const emptyConnection = {edges: [], pageInfo: {hasNextPage: false, hasPreviousPage: false}}
    if (viewerId !== userId) {
      const err = new Error('Cannot access another team members issues')
      standardError(err, {tags: {teamId, userId}, userId: viewerId})
      return emptyConnection
    }

    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})

    if (!auth) {
      return emptyConnection
    }

    const provider = await dataLoader.get('integrationProviders').loadNonNull(auth.providerId)

    const integrationManager = new JiraServerRestManager(
      auth,
      provider as IntegrationProviderJiraServer
    )

    if (!integrationManager) {
      return emptyConnection
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
      return {
        ...emptyConnection,
        error: {
          message: issueRes.message
        }
      }
    }

    const {issues} = issueRes

    const mappedIssues = issues.map((issue) => {
      const {project, issuetype, summary, description, updated} = issue.fields
      return {
        ...issue,
        userId,
        teamId,
        providerId: provider.id,
        issueKey: issue.key,
        description: description ?? '',
        descriptionHTML: issue.renderedFields.description,
        projectId: project.id,
        projectKey: project.key,
        projectName: project.name,
        issueType: issuetype.id,
        summary,
        service: 'jiraServer' as const,
        updatedAt: new Date(updated)
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
        hasNextPage: mappedIssues.length > nodes.length,
        hasPreviousPage: false
      }
    }
  },

  projects: async ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('allJiraServerProjects').load({teamId, userId})
  },

  providerId: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
      .load({service: 'jiraServer', teamId, userId})

    if (!auth) {
      return null
    }

    return IntegrationProviderId.join(auth.providerId)
  },

  searchQueries: async ({teamId, userId}, _args, {dataLoader}) => {
    const auth = await dataLoader
      .get('teamMemberIntegrationAuthsByServiceTeamAndUserId')
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
        id: String(searchQuery.id),
        queryString: query.queryString || '',
        isJQL: query.isJQL,
        projectKeyFilters: query.projectKeyFilters || [],
        lastUsedAt: searchQuery.lastUsedAt
      }
    })
  }
}

export default JiraServerIntegration
