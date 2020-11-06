import AtlassianServerManager from './AtlassianServerManager'
import getJiraCloudIdAndKey from './getJiraCloudIdAndKey'
import {DataLoaderWorker} from '../graphql/graphql'

const verifyJiraId = async (
  jiraId: string,
  teamId: string,
  userId: string,
  dataLoader: DataLoaderWorker
) => {
  const [cloudId, issueKey] = getJiraCloudIdAndKey(jiraId)
  if (!cloudId || !issueKey) return false
  const accessToken = await dataLoader.get('freshAtlassianAccessToken').load({teamId, userId})
  const manager = new AtlassianServerManager(accessToken)
  const issueRes = await manager.getIssue(cloudId, issueKey)
  if (!issueRes || 'message' in issueRes || 'errors' in issueRes) return false
  return true
}

export default verifyJiraId
