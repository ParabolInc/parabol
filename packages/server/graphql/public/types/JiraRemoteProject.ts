import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import type {JiraProject} from '../../../utils/AtlassianServerManager'
import type {JiraRemoteProjectResolvers} from '../resolverTypes'

export type JiraRemoteProjectSource = JiraProject & {
  service: 'jira'
  cloudId: string
  teamId: string
  userId: string
}

const JiraRemoteProject: JiraRemoteProjectResolvers = {
  __isTypeOf: ({service}) => service === 'jira',
  id: ({cloudId, key}) => JiraProjectId.join(cloudId, key),
  service: () => 'jira',
  avatar: ({avatarUrls, cloudId, teamId}) => {
    const url = avatarUrls['48x48']
    if (!url) return null
    // Rewrite direct instance URLs to the API gateway so the Bearer token is accepted
    const apiUrl = url.replace(
      /^https:\/\/[^.]+\.atlassian\.net\/(rest\/)/,
      `https://api.atlassian.com/ex/jira/${cloudId}/$1`
    )
    return makeAppURL(appOrigin, `/assets/Team/${teamId}/atlassian/${encodeURIComponent(apiUrl)}`)
  }
}

export default JiraRemoteProject
