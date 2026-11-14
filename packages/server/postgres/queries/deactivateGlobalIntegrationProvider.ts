import getKysely from '../getKysely'
import type {Integrationproviderauthstrategyenum, Integrationproviderserviceenum} from '../types/pg'

interface DeactivateGlobalIntegrationProviderInput {
  service: Integrationproviderserviceenum
  authStrategy: Integrationproviderauthstrategyenum
}

const deactivateGlobalIntegrationProvider = async (
  input: DeactivateGlobalIntegrationProviderInput
) => {
  const {service, authStrategy} = input
  return getKysely()
    .updateTable('IntegrationProvider')
    .set({isActive: false})
    .where('scope', '=', 'global')
    .where('service', '=', service)
    .where('authStrategy', '=', authStrategy)
    .where('isActive', '=', true)
    .execute()
}

export default deactivateGlobalIntegrationProvider
