import JiraProjectId from 'parabol-client/shared/gqlIds/JiraProjectId'
import AtlassianServerManager, {JiraProject} from '../../../utils/AtlassianServerManager'
import {
  createImageUrlHash,
  createParabolImageUrl,
  downloadAndCacheImage
} from '../../../utils/atlassian/jiraImages'
import {JiraRemoteProjectResolvers} from '../resolverTypes'

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
  avatar: async ({avatarUrls, teamId, userId}, _args: unknown, {dataLoader}) => {
    const url = avatarUrls['48x48']
    const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId})
    if (!auth) return null
    const {accessToken} = auth
    const manager = new AtlassianServerManager(accessToken)
    const avatarUrlHash = createImageUrlHash(url)
    await downloadAndCacheImage(manager, avatarUrlHash, url)
    return createParabolImageUrl(avatarUrlHash)
  }
}

export default JiraRemoteProject
