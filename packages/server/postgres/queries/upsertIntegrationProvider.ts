import getKysely from '../getKysely'
import type {
  Integrationproviderauthstrategyenum,
  Integrationproviderscopeenum,
  Integrationproviderserviceenum
} from '../types/pg'

interface IUpsertIntegrationProviderInput {
  service: Integrationproviderserviceenum
  authStrategy: Integrationproviderauthstrategyenum
  scope: Integrationproviderscopeenum
  clientId?: string
  tenantId?: string | null
  clientSecret?: string
  serverBaseUrl?: string
  sharedSecret?: string
  webhookUrl?: string
  teamId?: string | null
  orgId?: string | null
}

const upsertIntegrationProvider = async (provider: IUpsertIntegrationProviderInput) => {
  const result = await getKysely()
    .insertInto('IntegrationProvider')
    .values(provider)
    .onConflict((oc) =>
      oc.columns(['orgId', 'teamId', 'service', 'authStrategy']).doUpdateSet((eb) => ({
        service: eb.ref('excluded.service'),
        authStrategy: eb.ref('excluded.authStrategy'),
        scope: eb.ref('excluded.scope'),
        clientId: eb.ref('excluded.clientId'),
        tenantId: eb.ref('excluded.tenantId'),
        clientSecret: eb.ref('excluded.clientSecret'),
        consumerKey: eb.ref('excluded.consumerKey'),
        consumerSecret: eb.ref('excluded.consumerSecret'),
        serverBaseUrl: eb.ref('excluded.serverBaseUrl'),
        webhookUrl: eb.ref('excluded.webhookUrl'),
        sharedSecret: eb.ref('excluded.sharedSecret'),
        isActive: true
      }))
    )
    .returning('id')
    .executeTakeFirstOrThrow()
  return result.id
}

export default upsertIntegrationProvider
