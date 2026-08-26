import {isNotNull} from 'parabol-client/utils/predicates'
import type {Integrationproviderserviceenum} from '../../postgres/types/pg'
import {serverIntegrations} from './registry'
import type {IntegrationCtx} from './ServerIntegrationDefinition'

/** Services the viewer can act on right now (token refreshed first), not merely has a row for */
const getConnectedTaskServices = async (
  ctx: IntegrationCtx
): Promise<Integrationproviderserviceenum[]> => {
  const connected = await Promise.all(
    Object.values(serverIntegrations).map(async (definition) =>
      (await definition.resolveAuth(ctx)) ? definition.service : null
    )
  )
  return connected.filter(isNotNull)
}

export default getConnectedTaskServices
