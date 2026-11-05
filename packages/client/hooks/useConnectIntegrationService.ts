import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {useConnectIntegrationService_service$key} from '../__generated__/useConnectIntegrationService_service.graphql'
import type {ClientIntegrationDefinition} from '../integrations/platform/ClientIntegrationDefinition'
import {getConnectErrorMessage} from '../integrations/platform/getConnectErrorMessage'
import {listServiceProviders} from '../integrations/platform/integrationServiceProviders'
import useAtmosphere from './useAtmosphere'
import useMutationProps from './useMutationProps'

const useConnectIntegrationService = (
  definition: ClientIntegrationDefinition,
  serviceRef: useConnectIntegrationService_service$key | null | undefined,
  teamId: string
) => {
  const integrationService = useFragment(
    graphql`
      fragment useConnectIntegrationService_service on IntegrationService {
        grantedScopes
        ...integrationServiceProviders_service @relay(mask: false)
      }
    `,
    serviceRef
  )
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError, submitting} = mutationProps

  const connect = () => {
    const [provider] = integrationService ? listServiceProviders(integrationService) : []
    const isStarted =
      !!provider &&
      definition.connect(atmosphere, {
        teamId,
        mutationProps,
        provider,
        heldScopes: integrationService?.grantedScopes
      })
    if (!isStarted) onError(new Error(`Could not find the ${definition.title} app`))
  }

  return {connect, submitting, errorMessage: getConnectErrorMessage(error, definition)}
}

export default useConnectIntegrationService
