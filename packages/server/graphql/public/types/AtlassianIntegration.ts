import ms from 'ms'
import AtlassianIntegrationId from '../../../../client/shared/gqlIds/AtlassianIntegrationId'
import updateJiraSearchQueries from '../../../postgres/queries/updateJiraSearchQueries'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {downloadAndCacheImages, updateJiraImageUrls} from '../../../utils/atlassian/jiraImages'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {AtlassianIntegrationResolvers} from '../resolverTypes'

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
    // Request one extra item to see if there are more results
    const maxResults = first + 1
    // Relay requires the cursor to be a string
    const afterInt = parseInt(after ?? '-1', 10)
    const startAt = Number.isNaN(afterInt) ? 0 : afterInt + 1
    const issueRes = await manager.getIssues(
      queryString ?? null,
      isJQL,
      projectKeyFiltersByCloudId,
      maxResults,
      startAt
    )
    const {error, issues} = issueRes
    const mappedIssues = issues.map((issue) => {
      const {updatedDescription, imageUrlToHash} = updateJiraImageUrls(
        issue.cloudId,
        issue.descriptionHTML
      )
      downloadAndCacheImages(manager, imageUrlToHash)

      return {
        ...issue,
        teamId,
        userId,
        descriptionHTML: updatedDescription
      }
    })

    const nodes = mappedIssues.slice(0, first)
    const edges = nodes.map((node, index) => ({
      cursor: `${index + startAt}`,
      node
    }))

    const firstEdge = edges[0]

    return {
      error: error ? {message: error.message} : undefined,
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge ? edges[edges.length - 1]!.cursor : null,
        hasNextPage: mappedIssues.length > nodes.length,
        hasPreviousPage: false
      }
    }
  },
  id: ({teamId, userId}) => AtlassianIntegrationId.join(teamId, userId),

  isActive: ({accessToken}) => !!accessToken,

  accessToken: async ({accessToken, userId}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId ? accessToken : null
  },

  projects: ({teamId, userId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) return []
    return dataLoader.get('allJiraProjects').load({teamId, userId})
  },

  jiraSearchQueries: async ({teamId, userId, jiraSearchQueries}) => {
    const expirationThresh = ms('60d')
    const thresh = new Date(Date.now() - expirationThresh)
    const searchQueries = jiraSearchQueries || []
    const unexpiredQueries = searchQueries.filter((query) => query.lastUsedAt > thresh)
    if (unexpiredQueries.length < searchQueries.length) {
      await updateJiraSearchQueries({
        jiraSearchQueries: searchQueries,
        teamId,
        userId
      })
    }
    return unexpiredQueries
  }
}

export default AtlassianIntegration
