import {GraphQLError} from 'graphql'
import AtlassianIntegrationId from '../../../../client/shared/gqlIds/AtlassianIntegrationId'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {processJiraImages} from '../../../utils/atlassian/jiraImages'
import {getUserId} from '../../../utils/authorization'
import {ConfluenceApiError, ConfluenceServerManager} from '../../../utils/ConfluenceServerManager'
import {Logger} from '../../../utils/Logger'
import standardError from '../../../utils/standardError'
import type {AtlassianIntegrationResolvers} from '../resolverTypes'

const AtlassianIntegration: AtlassianIntegrationResolvers = {
  issues: async ({teamId, userId, accessToken, cloudIds}, args, {authToken}) => {
    const {first, queryString, isJQL, projectKeyFilters, after} = args
    const viewerId = getUserId(authToken)
    if (viewerId !== userId || !accessToken) {
      const err = new Error('Cannot access another team members issues')
      standardError(err, {tags: {teamId, userId}, userId: viewerId})
      return {
        error: {message: err.message},
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false
        }
      }
    }
    const manager = new AtlassianServerManager(accessToken)
    const projectKeyFiltersByCloudId = {} as {[cloudId: string]: string[]}
    if (projectKeyFilters && projectKeyFilters.length > 0) {
      projectKeyFilters.forEach((globalProjectKey) => {
        const [cloudId, projectKey] = globalProjectKey.split(':') as [string, string]
        projectKeyFiltersByCloudId[cloudId] = projectKeyFiltersByCloudId[cloudId] || []
        // guaranteed from line above
        projectKeyFiltersByCloudId[cloudId]!.push(projectKey)
      })
    } else {
      cloudIds.forEach((cloudId) => {
        projectKeyFiltersByCloudId[cloudId] = []
      })
    }

    if (after) {
      Logger.warn(
        `Ignoring 'after' argument in AtlassianIntegration.issues resolver. Pagination is not implemented yet.`
      )
    }

    const cloudResults = await Promise.all(
      Object.entries(projectKeyFiltersByCloudId).map(async ([cloudId, projectKeyFilters]) => {
        const issueRes = await manager.getIssues(
          cloudId,
          queryString ?? null,
          isJQL,
          projectKeyFilters,
          first
          // TODO implement proper pagination
          //after
        )
        const {error, issues, nextPageToken} = issueRes
        if (error) {
          return {
            error: {message: error.message},
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        }
        const nodes = await Promise.all(
          issues.map(async (issue) => {
            const descriptionHTML = await processJiraImages(
              manager,
              issue.cloudId,
              teamId,
              issue.descriptionHTML
            )
            return {
              ...issue,
              teamId,
              userId,
              descriptionHTML,
              extraFields: []
            }
          })
        )

        const edges = nodes.map((node) => ({
          node,
          cursor: node.issueKey
        }))

        return {
          edges,
          pageInfo: {
            startCursor: after,
            endCursor: nextPageToken,
            hasNextPage: !!nextPageToken,
            hasPreviousPage: false
          }
        }
      })
    )

    const combinedEdges = cloudResults.flatMap((result) => result.edges).filter(Boolean)
    const combinedError = cloudResults.find((result) => result.error)
    return {
      edges: combinedEdges.slice(0, first),
      // TODO if we want to paginate properly, we need to keep track of how many results from each cloudId we presented in addition to the cloudId's endCursor.
      // At the moment the client does not paginate anyway, so we just hack it together like this.
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: after,
        endCursor: null
      },
      error: combinedError?.error || null
    }
  },
  id: ({teamId, userId}) => AtlassianIntegrationId.join(teamId, userId),

  isActive: ({accessToken}) => !!accessToken,

  scope: ({scope, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId || !scope) return []
    return scope.split(' ')
  },

  confluenceSites: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId || !accessToken) return []
    const manager = new AtlassianServerManager(accessToken)
    const res = await manager.getAccessibleResources()
    if (!Array.isArray(res)) return []
    return res
      .filter(({scopes}) => scopes.some((scope) => scope.includes('confluence')))
      .map(({id, name, url}) => ({cloudId: id, name, url}))
  },

  confluenceSpaces: async ({accessToken, userId}, {cloudId, query}, {authToken}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId || !accessToken) return []
    const manager = new ConfluenceServerManager(accessToken, cloudId)
    try {
      const spaces = await manager.getSpaces()
      const normalizedQuery = query?.trim().toLowerCase()
      return normalizedQuery
        ? spaces.filter(({name}) => name.toLowerCase().includes(normalizedQuery))
        : spaces
    } catch (e) {
      if (e instanceof ConfluenceApiError && e.errorClass === 'forbidden') {
        throw new GraphQLError('No permission to list Confluence spaces on this site')
      }
      return []
    }
  },

  confluencePageSearch: async ({accessToken, userId}, {cloudId, spaceId, query}, {authToken}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId || !accessToken) return []
    const manager = new ConfluenceServerManager(accessToken, cloudId)
    try {
      return await manager.searchPagesInSpace(spaceId, query)
    } catch {
      return []
    }
  },

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  projects: async ({teamId, userId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) return []
    return dataLoader.get('allJiraProjects').load({teamId, userId})
  },

  jiraSearchQueries: async ({teamId, userId, providerId}, _args, {dataLoader}) => {
    const queries = await dataLoader
      .get('recentIntegrationSearchQueries')
      .load({teamId, userId, providerId})
    return queries
      .filter((row) => row.service === 'jira')
      .map(({id, query, lastUsedAt}) => ({
        id: String(id),
        ...query,
        lastUsedAt: lastUsedAt.toJSON()
      }))
  }
}

export default AtlassianIntegration
