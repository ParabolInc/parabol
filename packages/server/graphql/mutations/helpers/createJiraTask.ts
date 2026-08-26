import type {JSONContent} from '@tiptap/react'
import {convertTiptapToADF} from 'parabol-client/shared/tiptap/convertTipTapToADF'
import {splitTipTapContent} from 'parabol-client/shared/tiptap/splitTipTapContent'
import {RateLimitError} from 'parabol-client/utils/AtlassianManager'
import type {AtlassianAuth} from '../../../postgres/types'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'

const createJiraTask = async (
  rawContent: JSONContent,
  cloudId: string,
  projectKey: string,
  atlassianAuth: AtlassianAuth
) => {
  const {title: summary, bodyContent} = splitTipTapContent(rawContent)
  const description = convertTiptapToADF(bodyContent)

  const {accessToken, providerUserId} = atlassianAuth
  const manager = new AtlassianServerManager(accessToken)

  const issueMetaRes = await manager.getCreateMeta(cloudId, [projectKey], true)
  if (issueMetaRes instanceof Error || issueMetaRes instanceof RateLimitError)
    return {error: issueMetaRes}
  const {projects} = issueMetaRes
  const project = projects.find((project) => project.key === projectKey)
  if (!project) return {error: new Error('Project does not exist')}
  const {issuetypes} = project
  const bestType = issuetypes.find((type) => type.name === 'Task') || issuetypes[0]
  const {fields} = bestType
  const isOnCreateScreen = (fieldId: string) => !fields || fieldId in fields
  const payload = {
    summary,
    issuetype: {id: bestType.id},
    ...(isOnCreateScreen('description') && {description}),
    ...(isOnCreateScreen('assignee') && {assignee: {id: providerUserId}}),
    ...(isOnCreateScreen('labels') && {labels: ['parabol']})
  }
  const res = await manager.createIssue(cloudId, projectKey, payload)
  if (res instanceof Error) return {error: res}
  const {key: issueKey} = res
  return {issueKey}
}

export default createJiraTask
