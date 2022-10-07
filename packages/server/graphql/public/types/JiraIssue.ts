import JiraIssueId from '../../../../client/shared/gqlIds/JiraIssueId'
import JiraProjectKeyId from '../../../../client/shared/gqlIds/JiraProjectKeyId'
import {JiraIssueResolvers} from '../resolverTypes'

const JiraIssue: JiraIssueResolvers = {
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
  projectKey: ({issueKey}) => JiraProjectKeyId.join(issueKey),
  project: async ({issueKey, teamId, userId, cloudId}, _args: unknown, {dataLoader}) => {
    const projectKey = JiraProjectKeyId.join(issueKey)
    const jiraRemoteProjectRes = await dataLoader
      .get('jiraRemoteProject')
      .load({cloudId, projectKey, teamId, userId})
    return {
      ...jiraRemoteProjectRes,
      service: 'jira',
      cloudId,
      userId,
      teamId
    }
  },
  description: ({description}) => (description ? JSON.stringify(description) : '')
}

export default JiraIssue
