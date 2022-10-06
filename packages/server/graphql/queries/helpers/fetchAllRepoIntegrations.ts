import {GraphQLResolveInfo} from 'graphql'
import {GQLContext} from '../../graphql'
import fetchGitHubRepos from './fetchGitHubRepos'
import fetchGitLabProjects from './fetchGitLabProjects'

const fetchAllRepoIntegrations = async (
  teamId: string,
  userId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [jiraProjects, githubRepos, gitlabProjects, jiraServerProjects, azureProjects] =
    await Promise.all([
      dataLoader.get('allJiraProjects').load({teamId, userId}),
      fetchGitHubRepos(teamId, userId, dataLoader, context, info),
      fetchGitLabProjects(teamId, userId, context, info),
      dataLoader.get('allJiraServerProjects').load({teamId, userId}),
      dataLoader.get('allAzureDevOpsProjects').load({teamId, userId})
    ])
  const fetchedRepoIntegrations = [
    ...jiraProjects,
    ...githubRepos,
    ...gitlabProjects,
    ...jiraServerProjects,
    ...azureProjects
  ]

  // alternate the repoIntegrations by service so the user is aware of all available services
  const repoIntegrationsAltServices = []
  let loopCount = 0
  while (repoIntegrationsAltServices.length < fetchedRepoIntegrations.length) {
    if (jiraProjects[loopCount]) {
      repoIntegrationsAltServices.push(jiraProjects[loopCount])
    }
    if (githubRepos[loopCount]) {
      repoIntegrationsAltServices.push(githubRepos[loopCount])
    }
    if (gitlabProjects[loopCount]) {
      repoIntegrationsAltServices.push(gitlabProjects[loopCount])
    }
    if (jiraServerProjects[loopCount]) {
      repoIntegrationsAltServices.push(jiraServerProjects[loopCount])
    }
    if (azureProjects[loopCount]) {
      repoIntegrationsAltServices.push(azureProjects[loopCount])
    }
    loopCount++
  }

  return repoIntegrationsAltServices

  // const repoIntegrationsLastUsedAt = {} as {[repoIntegrationId: string]: Date}
  // // prevRepoIntegrations.forEach((integration) => {
  // //   const integrationId = IntegrationRepoId.join(integration)
  // //   if (!integrationId) return
  // //   repoIntegrationsLastUsedAt[integrationId] = integration.lastUsedAt
  // // })
  // return fetchedRepoIntegrations
  //   .map((repo) => ({
  //     ...repo,
  //     // always have lastUsedAt be a Date (to make the sort easier below)
  //     lastUsedAt: repoIntegrationsLastUsedAt[repo.id] ?? new Date(0)
  //   }))
  //   .sort((a, b) =>
  //     a.lastUsedAt > b.lastUsedAt
  //       ? -1
  //       : a.service < b.service
  //       ? -1
  //       : a.id.toLowerCase() < b.id.toLowerCase()
  //       ? -1
  //       : 1
  //   )
}

export default fetchAllRepoIntegrations
