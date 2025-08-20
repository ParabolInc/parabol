import ms from 'ms'
import AtlassianIntegrationId from '../../../../client/shared/gqlIds/AtlassianIntegrationId'
import updateJiraSearchQueries from '../../../postgres/queries/updateJiraSearchQueries'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {downloadAndCacheImages, updateJiraImageUrls} from '../../../utils/atlassian/jiraImages'
import {getUserId} from '../../../utils/authorization'
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
        const nodes = issues.map((issue) => {
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

        const edges = nodes.map((node, _index) => ({
          node
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

    const combinedEdges = cloudResults
      .flatMap((result) => result.edges)
      .filter(Boolean)
      .sort((a, b) => b.node.lastViewed.localeCompare(a.node.lastViewed))
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
