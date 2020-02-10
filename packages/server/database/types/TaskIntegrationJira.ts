import {TaskServiceEnum} from 'parabol-client/types/graphql'
import TaskIntegration from '../../graphql/types/TaskIntegration'

interface Input {
  projectKey: string
  projectName: string
  cloudId: string
  issueKey: string
  cloudName: string
}

export default class TaskIntegrationJira extends TaskIntegration {
  projectKey: string
  projectName: string
  cloudId: string
  issueKey: string
  cloudName: string
  constructor(input: Input) {
    const {projectKey, projectName, cloudId, cloudName, issueKey} = input
    super({service: TaskServiceEnum.jira})
    this.projectKey = projectKey
    this.projectName = projectName
    this.cloudId = cloudId
    this.issueKey = issueKey
    this.cloudName = cloudName
  }
}
