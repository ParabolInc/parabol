import {JSONContent} from '@tiptap/core'
import {GraphQLResolveInfo} from 'graphql'
import LinearProjectId from '../../../../client/shared/gqlIds/LinearProjectId'
import {splitTipTapContent} from '../../../../client/shared/tiptap/splitTipTapContent'
import LinearServerManager from '../../../integrations/linear/LinearServerManager'
import {TeamMemberIntegrationAuth} from '../../../postgres/types'
import {convertTipTapToMarkdown} from '../../../utils/convertTipTapToMarkdown'
import {GQLContext} from '../../graphql'

const createLinearTask = async (
  rawContentJSON: JSONContent,
  integrationRepoId: string,
  linearAuth: TeamMemberIntegrationAuth,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  const {accessToken} = linearAuth
  if (!accessToken) return {error: new Error('Invalid Linear auth')}
  const {title, bodyContent} = splitTipTapContent(rawContentJSON)
  const description = convertTipTapToMarkdown(bodyContent)
  const manager = new LinearServerManager(linearAuth, context, info)
  const {teamId, projectId} = LinearProjectId.split(integrationRepoId)
  if (!teamId) {
    return {error: new Error('Creating Linear Issue requires teamId')}
  }
  const [createIssueData, createIssueError] = await manager.createIssueInternal({
    title,
    description,
    teamId,
    projectId: projectId ? projectId : null
  })

  if (createIssueError) {
    return {error: createIssueError}
  }

  const issue = createIssueData?.issueCreate?.issue
  if (!issue || !issue.id) {
    return {error: new Error('Failed to create Linear issue')}
  }

  return {
    service: 'linear',
    issueId: issue.id,
    repoId: integrationRepoId
  }
}

export default createLinearTask
