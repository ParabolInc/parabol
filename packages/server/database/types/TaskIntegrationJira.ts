import JiraIssueId from '../../../client/shared/gqlIds/JiraIssueId'
import BaseTaskIntegration from './BaseTaskIntegration'

interface Input {
  accessUserId: string
  cloudId: string
  issueKey: string
}

export default class TaskIntegrationJira extends BaseTaskIntegration {
  cloudId: string
  issueKey: string
  projectKey: string
  service!: 'jira'
  constructor(input: Input) {
    const {accessUserId, cloudId, issueKey} = input
    super({accessUserId, service: 'jira'})
    const {projectKey} = JiraIssueId.split(issueKey)
    this.projectKey = projectKey
    this.cloudId = cloudId
    this.issueKey = issueKey
  }
}
