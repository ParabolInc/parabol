import type {JSONContent} from '@tiptap/core'
import type {GraphQLResolveInfo} from 'graphql'
import {removeNodeByType} from '../../../../client/shared/tiptap/removeNodeByType'
import {getServerIntegration} from '../../../integrations/platform/registry'
import type {GQLContext} from '../../graphql'
import type {CreateTaskIntegrationInput} from '../../public/resolverTypes'

const createIntegrationIssue = async (
  integrationInput: CreateTaskIntegrationInput | null | undefined,
  rawContent: JSONContent,
  accessUserId: string,
  teamId: string,
  context: GQLContext,
  info: GraphQLResolveInfo
) => {
  if (!integrationInput) {
    return {integrationHash: undefined, integration: undefined, integrationRepoId: undefined}
  }
  const {service, serviceProjectHash} = integrationInput
  const definition = getServerIntegration(service)
  const issueCreate = definition?.capabilities.issueCreate
  if (!definition || !issueCreate) return {error: new Error('Unknown integration')}
  const {dataLoader} = context
  const manager = await issueCreate.initManager({
    dataLoader,
    teamId,
    userId: accessUserId,
    context,
    info
  })
  if (!manager) {
    const {title} = definition
    return {error: new Error(`Cannot create ${title} task without a valid ${title} token`)}
  }
  const res = await manager.createTask({
    rawContentJSON: removeNodeByType(rawContent, 'taskTag'),
    integrationRepoId: serviceProjectHash
  })
  if (res instanceof Error) return {error: res}
  const {integrationHash, integration} = res
  return {integrationHash, integration, integrationRepoId: serviceProjectHash}
}

export default createIntegrationIssue
