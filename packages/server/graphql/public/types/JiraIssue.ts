import JiraIssueId from '../../../../client/shared/gqlIds/JiraIssueId'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import {JiraIssueResolvers} from '../resolverTypes'

export type JiraIssueSource = {
  cloudId: string
  issueKey: string
  teamId: string
  userId: string
  description?: string
  issuetype: {
    iconUrl: string
  }
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
  description: ({description}) => (description ? JSON.stringify(description) : '')
}

export default JiraIssue
