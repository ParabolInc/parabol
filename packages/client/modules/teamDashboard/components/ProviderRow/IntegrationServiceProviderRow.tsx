import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {IntegrationServiceProviderRow_service$key} from '../../../../__generated__/IntegrationServiceProviderRow_service.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {getConnectErrorMessage} from '../../../../integrations/platform/getConnectErrorMessage'
import {
  getProviderRowEntries,
  listServiceProviders,
  type ProviderRowEntryModel
} from '../../../../integrations/platform/integrationServiceProviders'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../../../../integrations/platform/registry'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import ConnectButton from './ConnectButton'
import ContactUsButton from './ContactUsButton'
import IntegrationServiceConfigMenu from './IntegrationServiceConfigMenu'
import ProviderRowEntry, {type ProviderRowEntryProps} from './ProviderRowEntry'
import ProviderRowShell from './ProviderRowShell'

interface Props {
  teamId: string
  serviceRef: IntegrationServiceProviderRow_service$key
}

const IntegrationServiceProviderRow = (props: Props) => {
  const {teamId, serviceRef} = props
  const integrationService = useFragment(
    graphql`
      fragment IntegrationServiceProviderRow_service on IntegrationService {
        service
        title
        isAvailable
        isConnected
        grantedScopes
        auth {
          providerId
        }
        cloudProvider {
          id
          scope
          ... on IntegrationProviderOAuth2 {
            clientId
            serverBaseUrl
            tenantId
          }
        }
        sharedProviders {
          id
          scope
          ... on IntegrationProviderOAuth2 {
            clientId
            serverBaseUrl
            tenantId
          }
        }
      }
    `,
    serviceRef
  )
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, error} = mutationProps
  const {
    service,
    title,
    isAvailable,
    isConnected,
    grantedScopes,
    auth,
    cloudProvider,
    sharedProviders
  } = integrationService
  if (!isRegisteredClientIntegration(service)) return null
  const definition = getClientIntegration(service)
  const {description, contactUs, ProviderLogo} = definition

  if (!isAvailable) {
    if (!contactUs) return null
    return (
      <ProviderRowShell providerLogo={<ProviderLogo />}>
        <ProviderRowEntry
          name={title}
          description={description}
          connected={false}
          configMenu={null}
          connectButton={
            <ContactUsButton
              contactUsUrl={contactUs.url}
              onContactUsSubmit={() => SendClientSideEvent(atmosphere, contactUs.clickEvent)}
            />
          }
        />
      </ProviderRowShell>
    )
  }

  const providers = listServiceProviders({cloudProvider, sharedProviders})
  const entries = getProviderRowEntries({title, description, isConnected, auth, providers})
  if (entries.length === 0) return null
  const errorMessage = getConnectErrorMessage(error, definition)

  const entryProps = (entry: ProviderRowEntryModel): ProviderRowEntryProps => ({
    name: entry.name,
    description: entry.description,
    error: errorMessage,
    connected: isConnected,
    connectButton: (
      <ConnectButton
        onConnectClick={() =>
          definition.connect(atmosphere, {
            teamId,
            mutationProps,
            provider: entry.provider,
            heldScopes: grantedScopes
          })
        }
        submitting={submitting}
      />
    ),
    configMenu: (
      <IntegrationServiceConfigMenu
        definition={definition}
        teamId={teamId}
        provider={entry.provider}
        grantedScopes={grantedScopes}
        mutationProps={mutationProps}
      />
    )
  })

  if (entries.length === 1) {
    return (
      <ProviderRowShell providerLogo={<ProviderLogo />}>
        <ProviderRowEntry {...entryProps(entries[0]!)} />
      </ProviderRowShell>
    )
  }

  return (
    <ProviderRowShell providerLogo={<ProviderLogo />} headerClassName='pb-0'>
      <div className='flex w-full flex-col'>
        {entries.map((entry) => (
          <div key={entry.provider.id} className='flex w-full flex-row pb-4'>
            <ProviderRowEntry {...entryProps(entry)} />
          </div>
        ))}
      </div>
    </ProviderRowShell>
  )
}

export default IntegrationServiceProviderRow
