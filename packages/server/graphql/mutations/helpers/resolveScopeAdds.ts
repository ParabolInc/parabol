import {getServerIntegration} from '../../../integrations/platform/registry'
import type {GqlIntegrationCtx} from '../../../integrations/platform/ServerIntegrationDefinition'
import type {Task} from '../../../postgres/types'
import type {UpdatePokerScopeItemInput} from '../../public/resolverTypes'

export type ResolvedScopeAdd = UpdatePokerScopeItemInput & {
  integration: NonNullable<Task['integration']> | null
}

const resolveScopeAdds = async (
  adds: UpdatePokerScopeItemInput[],
  ctx: GqlIntegrationCtx
): Promise<ResolvedScopeAdd[] | Error> => {
  const resolved = await Promise.all(
    adds.map(async (update): Promise<ResolvedScopeAdd | Error> => {
      if (update.service === 'PARABOL') return {...update, integration: null}
      const definition = getServerIntegration(update.service)
      if (!definition) return new Error(`${update.service} cannot be added to a poker meeting`)
      const ref = await definition.resolveIssue(ctx, update.serviceTaskId)
      if (!ref) return new Error(`${definition.title} issue not found`)
      return {...update, serviceTaskId: ref.integrationHash, integration: ref.integration}
    })
  )
  const resolvedAdds = resolved.filter((item): item is ResolvedScopeAdd => !(item instanceof Error))
  if (resolvedAdds.length === 0) {
    const firstFailure = resolved.find((item): item is Error => item instanceof Error)
    if (firstFailure) return firstFailure
  }
  const byServiceTaskId = new Map<string, ResolvedScopeAdd>()
  resolvedAdds.forEach((add) => {
    if (!byServiceTaskId.has(add.serviceTaskId)) byServiceTaskId.set(add.serviceTaskId, add)
  })
  return [...byServiceTaskId.values()]
}

export default resolveScopeAdds
