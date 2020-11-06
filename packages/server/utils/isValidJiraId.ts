import AtlassianServerManager from './AtlassianServerManager'
import getJiraCloudIdAndKey from './getJiraCloudIdAndKey'
import {getUserId} from './authorization'

const isValidJiraId = async (jiraId: string, teamId: string, {authToken, dataLoader}) => {
  const viewerId = getUserId(authToken)
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
  if (!auth) return false
  const {accessToken} = auth
  const [cloudId, issueKey] = getJiraCloudIdAndKey(jiraId)
  if (!cloudId || !issueKey) return false
  const manager = new AtlassianServerManager(accessToken)
  const issueRes = await manager.getIssue(cloudId, issueKey)
  if (!issueRes || 'message' in issueRes || 'errors' in issueRes) return false
  return true
}

export default isValidJiraId
