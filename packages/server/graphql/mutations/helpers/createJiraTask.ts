import {stateToMarkdown} from 'draft-js-export-markdown'
import splitDraftContent from 'parabol-client/utils/draftjs/splitDraftContent'
import {AtlassianAuth} from '../../../postgres/queries/getAtlassianAuthByUserIdTeamId'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'

const createJiraTask = async (
  rawContent: string,
  cloudId: string,
  projectKey: string,
  atlassianAuth: AtlassianAuth
) => {
  const {title: summary, contentState} = splitDraftContent(rawContent)
  const markdown = stateToMarkdown(contentState)

  const {accessToken, accountId} = atlassianAuth
  const manager = new AtlassianServerManager(accessToken)

  const [issueMetaRes, description] = await Promise.all([
    manager.getCreateMeta(cloudId, [projectKey]),
    manager.convertMarkdownToADF(markdown)
  ])
  if (issueMetaRes instanceof Error) return {error: issueMetaRes}
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
