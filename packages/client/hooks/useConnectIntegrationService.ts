import type {ClientIntegrationDefinition} from '../integrations/platform/ClientIntegrationDefinition'
import {getConnectErrorMessage} from '../integrations/platform/getConnectErrorMessage'
import {
  listServiceProviders,
  type RawServiceProvider
} from '../integrations/platform/integrationServiceProviders'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'

interface ConnectableIntegrationService {
  grantedScopes: readonly string[]
  cloudProvider: RawServiceProvider | null | undefined
  sharedProviders: readonly RawServiceProvider[]
}

const useConnectIntegrationService = (
  definition: ClientIntegrationDefinition,
  integrationService: ConnectableIntegrationService | undefined,
  teamId: string
) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError, submitting} = mutationProps

  const connect = () => {
    const [provider] = integrationService ? listServiceProviders(integrationService) : []
    if (!integrationService || !provider) {
      onError(new Error(`Could not find the ${definition.title} app`))
      return false
    }
    definition.connect(atmosphere, {
      teamId,
      mutationProps,
      provider,
      heldScopes: integrationService.grantedScopes
    })
    return true
  }

  return {connect, submitting, errorMessage: getConnectErrorMessage(error, definition)}
}

export default useConnectIntegrationService
