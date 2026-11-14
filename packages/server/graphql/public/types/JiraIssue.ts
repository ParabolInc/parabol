import JiraIssueId from '../../../../client/integrations/jira/shared/JiraIssueId'
import JiraProjectKeyId from '../../../../client/integrations/jira/shared/JiraProjectKeyId'
import type {JiraRawStatus} from '../../../integrations/jira/AtlassianServerManager'
import {generateJiraExtraFields} from '../../../integrations/jira/generateJiraExtraFields'
import type {JiraIssueResolvers} from '../resolverTypes'

export type JiraIssueSource = {
  cloudId: string
  issueKey: string
  teamId: string
  userId: string
  summary: string
  description?: string
  issuetype: {
    iconUrl: string
  }
  extraFields: ReturnType<typeof generateJiraExtraFields>
  status?: JiraRawStatus
}

const JiraIssue: JiraIssueResolvers = {
  __isTypeOf: ({cloudId, issueKey}) => !!(cloudId && issueKey),
  id: ({cloudId, issueKey}) => {
    return JiraIssueId.join(cloudId, issueKey)
  },
  cloudName: async ({cloudId, teamId, userId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
  },
  url: async ({cloudId, teamId, userId, issueKey}, _args: unknown, {dataLoader}) => {
    const cloudName = await dataLoader.get('atlassianCloudName').load({cloudId, teamId, userId})
    return `https://${cloudName}.atlassian.net/browse/${issueKey}`
  },
  issueIcon: ({issuetype}) => {
    return issuetype.iconUrl
  },
  projectKey: ({issueKey}) => JiraProjectKeyId.join(issueKey),
  project: async ({issueKey, teamId, userId, cloudId}, _args: unknown, {dataLoader}) => {
    const projectKey = JiraProjectKeyId.join(issueKey)
    const jiraRemoteProjectRes = await dataLoader
      .get('jiraRemoteProject')
      .load({cloudId, projectKey, teamId, userId})
    return jiraRemoteProjectRes
      ? {
          ...jiraRemoteProjectRes,
          service: 'jira',
          cloudId,
          userId,
          teamId
        }
      : null
  },
  title: ({summary}) => summary,
  status: ({status}) => (status ? {name: status.name, category: status.statusCategory.key} : null),
  description: ({description}) => (description ? JSON.stringify(description) : ''),
  extraFields: async ({extraFields}) => extraFields || []
}

export default JiraIssue
