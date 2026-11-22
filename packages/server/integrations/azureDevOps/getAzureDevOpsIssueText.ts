import type {IssueText} from '../platform/InspirationIssue'
import type {IssueTextCtx} from '../platform/ServerIntegrationDefinition'
import azureDevOpsHtmlToText from './azureDevOpsHtmlToText'

const getAzureDevOpsIssueText = async ({
  task,
  dataLoader
}: IssueTextCtx): Promise<IssueText | null> => {
  const {integration, teamId} = task
  if (integration?.service !== 'azureDevOps') return null
  const workItem = await dataLoader.get('integrationIssue').load({teamId, integration})
  if (workItem?.service !== 'azureDevOps') return null
  return {
    title: workItem.title,
    reference: `#${workItem.id}`,
    description: azureDevOpsHtmlToText(workItem.descriptionHTML)
  }
}

export default getAzureDevOpsIssueText
