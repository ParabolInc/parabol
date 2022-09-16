import {downloadAndCacheImages, updateJiraImageUrls} from '../../../utils/atlassian/jiraImages'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import {AtlassianIntegrationResolvers} from '../resolverTypes'

const AtlassianIntegration: AtlassianIntegrationResolvers = {
  issues: async ({teamId, userId, accessToken, cloudIds}, args, {authToken}) => {
    const {first, queryString, isJQL, projectKeyFilters} = args
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) {
      const err = new Error('Cannot access another team members issues')
      standardError(err, {tags: {teamId, userId}, userId: viewerId})
      return connectionFromTasks([], 0, err)
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
    const issueRes = await manager.getIssues(queryString, isJQL, projectKeyFiltersByCloudId)
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
        descriptionHTML: updatedDescription,
        updatedAt: new Date()
      }
    })
    return connectionFromTasks(mappedIssues, first, error ? {message: error.message} : undefined)
  }
}

export default AtlassianIntegration
