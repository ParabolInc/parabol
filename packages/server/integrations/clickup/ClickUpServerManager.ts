import {clickupIntegrationMeta} from 'parabol-client/integrations/clickup/shared/clickupIntegrationMeta'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import type {CreateTaskResponse, TaskIntegrationManager} from '../platform/TaskIntegrationManager'

export default class ClickUpServerManager implements TaskIntegrationManager {
  readonly title = clickupIntegrationMeta.title
  readonly auth: TeamMemberIntegrationAuth

  constructor(auth: TeamMemberIntegrationAuth) {
    this.auth = auth
  }

  async createTask(): Promise<CreateTaskResponse> {
    return new Error('ClickUp: creating an issue is not implemented')
  }

  async addCreatedBySomeoneElseComment(): Promise<string | Error> {
    return new Error('ClickUp: commenting on an issue is not implemented')
  }
}
