import {JSONContent} from '@tiptap/core'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import {AtlassianAuth} from '../../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {convertTipTapToADF} from '../../../utils/convertTipTapToADF'

const createJiraTask = async (
  rawContent: JSONContent,
  cloudId: string,
  projectKey: string,
  atlassianAuth: AtlassianAuth
) => {
  const {title: summary, bodyContent} = splitTipTapContent(rawContent)
  const description = convertTipTapToADF(bodyContent)

  const {accessToken, accountId} = atlassianAuth
  const manager = new AtlassianServerManager(accessToken)

  const issueMetaRes = await manager.getCreateMeta(cloudId, [projectKey])
  if (issueMetaRes instanceof Error || issueMetaRes instanceof RateLimitError)
    return {error: issueMetaRes}
  const {projects} = issueMetaRes
  // should always be the first and only item in the project arr
  const project = projects.find((project) => project.key === projectKey)
  if (!project) return {error: new Error('Project does not exist')}
  const {issuetypes} = project
  const bestType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]
  const payload = {
    summary,
    description,
    // ERROR: Field 'reporter' cannot be set. It is not on the appropriate screen, or unknown.
    assignee: {
      id: accountId
    },
    issuetype: {
      id: bestType.id
    }
  }
  const res = await manager.createIssue(cloudId, projectKey, payload)
  if (res instanceof Error) return {error: res}
  const {key: issueKey} = res
  return {issueKey}
}

export default createJiraTask
