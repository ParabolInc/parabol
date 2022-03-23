import {GraphQLResolveInfo} from 'graphql'
import {Doc} from '../utils/convertContentStateToADF'
import {GQLContext} from '../graphql/graphql'
import {TaskIntegration} from '../database/types/Task'

export type CreateTaskResponse =
  | {
      integrationHash: string
      // TODO: include issueId for GitHub in hash or store integration.issueId for all integrations
      // See https://github.com/ParabolInc/parabol/issues/6252
      issueId: string
      integration: TaskIntegration
    }
  | Error

export default abstract class AbstractTaskIntegrationManager {
  abstract title: string

  abstract createTask(params: {
    rawContentStr: string
    integrationRepoId: string
    createdBySomeoneElseComment?: Doc | string
    context?: GQLContext
    info?: GraphQLResolveInfo
  }): Promise<CreateTaskResponse>
}
