import JiraProjectKeyId from 'parabol-client/integrations/jira/shared/JiraProjectKeyId'
import convertADFToTipTap, {type AdfNode} from 'parabol-client/shared/tiptap/convertADFToTipTap'
import type {AnyTaskIntegration} from 'parabol-client/shared/types/TaskIntegration'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import AtlassianServerManager from '../../../integrations/jira/AtlassianServerManager'
import adfToPlaintext from '../../../integrations/jira/adfToPlaintext'
import type {DataLoaderWorker} from '../../graphql'

const MAX_RECENT_ISSUES = 50

interface Options {
  dataLoader: DataLoaderWorker
  teamId: string
  integration: Extract<AnyTaskIntegration, {service: 'jira'}>
  repoId: string
  dimensionName: string
}

const buildPopoverContent = (description: AdfNode | null | undefined, title: string) => {
  const adf = description ?? {type: 'doc', content: []}
  return JSON.stringify(convertADFToTipTap(adf, title))
}

const getJiraEstimateCandidates = async (options: Options) => {
  const {dataLoader, teamId, integration, repoId, dimensionName} = options
  const {cloudId, issueKey, accessUserId} = integration
  const dimensionFields = await dataLoader
    .get('integrationDimensionFieldMaps')
    .load({teamId, service: 'jira', repoId, dimensionName})
  const fieldId = dimensionFields.find(
    ({fieldId}) =>
      fieldId !== SprintPokerDefaults.SERVICE_FIELD_COMMENT &&
      fieldId !== SprintPokerDefaults.SERVICE_FIELD_NULL
  )?.fieldId
  if (!fieldId) return []
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: accessUserId})
  if (!auth) return []
  const manager = new AtlassianServerManager(auth.accessToken)
  const {issues} = await manager.getProjectIssuesWithField(
    cloudId,
    JiraProjectKeyId.join(issueKey),
    fieldId,
    MAX_RECENT_ISSUES
  )
  return (issues ?? [])
    .filter((issue) => issue.issueKey !== issueKey)
    .map((issue) => ({
      issueKey: issue.issueKey,
      title: issue.summary,
      description: adfToPlaintext(issue.description),
      storyPoints: issue.storyPoints,
      content: buildPopoverContent(issue.description, issue.summary)
    }))
}

export default getJiraEstimateCandidates
