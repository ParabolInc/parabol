import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'

const getClickUpIssueText = async ({task, dataLoader}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'clickup') return null
  const clickUpTask = await dataLoader.get('integrationIssue').load({teamId, integration})
  if (clickUpTask?.service !== 'clickup') return null
  return {
    title: clickUpTask.title,
    reference: clickUpTask.customId ?? clickUpTask.taskId,
    description: clickUpTask.description
  }
}

export default getClickUpIssueText
