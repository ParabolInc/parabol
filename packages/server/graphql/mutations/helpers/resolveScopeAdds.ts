import {getServerIntegration} from '../../../integrations/platform/registry'
import type {GqlIntegrationCtx} from '../../../integrations/platform/ServerIntegrationDefinition'
import type {Task} from '../../../postgres/types'
import logError from '../../../utils/logError'
import type {UpdatePokerScopeItemInput} from '../../public/resolverTypes'

export type ResolvedScopeAdd = UpdatePokerScopeItemInput & {
  integration: NonNullable<Task['integration']> | null
}

type ScopeAddFailure = {service: string; error: Error}

const resolveScopeAdds = async (
  adds: UpdatePokerScopeItemInput[],
  ctx: GqlIntegrationCtx
): Promise<ResolvedScopeAdd[] | Error> => {
  const results = await Promise.all(
    adds.map(async (update): Promise<ResolvedScopeAdd | ScopeAddFailure> => {
      if (update.service === 'PARABOL') return {...update, integration: null}
      const definition = getServerIntegration(update.service)
      if (!definition) {
        return {
          service: update.service,
          error: new Error(`${update.service} cannot be added to a poker meeting`)
        }
      }
      const ref = await definition.resolveIssue(ctx, update.serviceTaskId)
      if (!ref) {
        return {
          service: update.service,
          error: new Error(`${definition.title} issue not found: ${update.serviceTaskId}`)
        }
      }
      return {...update, serviceTaskId: ref.integrationHash, integration: ref.integration}
    })
  )
  const failures = results.flatMap((result) => ('error' in result ? [result] : []))
  failures.forEach(({service, error}) => {
    logError(error, {tags: {service, teamId: ctx.teamId}, userId: ctx.userId})
  })
  const resolvedAdds = results.flatMap((result) => ('error' in result ? [] : [result]))
  const firstFailure = failures[0]
  if (resolvedAdds.length === 0 && firstFailure) return firstFailure.error
  const byServiceTaskId = new Map<string, ResolvedScopeAdd>()
  resolvedAdds.forEach((add) => {
    if (!byServiceTaskId.has(add.serviceTaskId)) byServiceTaskId.set(add.serviceTaskId, add)
  })
  return [...byServiceTaskId.values()]
}

export default resolveScopeAdds
