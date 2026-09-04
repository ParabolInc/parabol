import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {ScopePhaseAreaConnect_service$key} from '../__generated__/ScopePhaseAreaConnect_service.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import type {ConnectProviderRef} from '../integrations/platform/ClientIntegrationDefinition'
import {getClientIntegration} from '../integrations/platform/registry'
import {Button} from '../ui/Button/Button'
import {ERROR_POPUP_CLOSED} from '../utils/AtlassianClientManager'
import {SALES_EMAIL} from '../utils/constants'

interface Props {
  teamId: string
  gotoParabol: () => void
  serviceRef: ScopePhaseAreaConnect_service$key
}

const toConnectProviderRef = (provider: {
  id: string
  clientId?: string
  serverBaseUrl?: string
  tenantId?: string | null
}): ConnectProviderRef => ({
  id: provider.id,
  clientId: provider.clientId ?? null,
  serverBaseUrl: provider.serverBaseUrl ?? null,
  tenantId: provider.tenantId ?? null
})

const ScopePhaseAreaConnect = (props: Props) => {
  const {teamId, gotoParabol, serviceRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error} = mutationProps
  const integrationService = useFragment(
    graphql`
      fragment ScopePhaseAreaConnect_service on IntegrationService {
        service
        title
        isAvailable
        grantedScopes
        cloudProvider {
          id
          ... on IntegrationProviderOAuth2 {
            clientId
            serverBaseUrl
            tenantId
          }
        }
        sharedProviders {
          id
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
  const {service, title, isAvailable, grantedScopes, cloudProvider, sharedProviders} =
    integrationService
  const definition = getClientIntegration(service)
  if (!definition) return null

  if (!isAvailable) {
    return (
      <div className='flex h-full flex-col items-center justify-center'>
        <div className='max-w-[360px] text-center'>
          <p className='mb-2 font-semibold text-base'>
            {`Bring your ${title} issues into your retros and sprint planning.`}
          </p>
          <p className='text-fg-secondary text-sm'>
            {'Ready to unlock it for your org? Reach out to '}
            <a
              className='text-accent no-underline hover:text-sky-600 focus:text-sky-600'
              href={`mailto:${SALES_EMAIL}`}
            >
              {SALES_EMAIL}
            </a>
            {" and we'll get you set up."}
          </p>
        </div>
      </div>
    )
  }

  const rawProvider = sharedProviders[0] ?? cloudProvider
  const provider = rawProvider ? toConnectProviderRef(rawProvider) : undefined
  const onConnect = () => {
    definition.connect(atmosphere, {teamId, mutationProps, provider, heldScopes: grantedScopes})
  }
  const errorMessage =
    error?.message === ERROR_POPUP_CLOSED && definition.authorizationHelpUrl ? (
      <>
        Having trouble authorizing Parabol? Try our{' '}
        <a href={definition.authorizationHelpUrl} target='_blank' rel='noreferrer'>
          troubleshooting guide
        </a>
      </>
    ) : (
      error?.message
    )

  return (
    <div className='flex h-full flex-col items-center justify-center'>
      <Button
        variant='raised'
        size='md'
        className='gap-2 whitespace-pre-wrap bg-surface-card text-fg-primary'
        onClick={onConnect}
      >
        <definition.Icon className={definition.iconClassName} />
        {`Import issues from ${title}`}
      </Button>
      {errorMessage && (
        <div className='p-4 pb-0 text-fg-error [&_a]:font-semibold [&_a]:text-fg-error [&_a]:underline'>
          {errorMessage}
        </div>
      )}
      <span
        className='cursor-pointer pt-6 text-accent outline-none hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={gotoParabol}
      >
        Or add new tasks in Parabol
      </span>
    </div>
  )
}

export default ScopePhaseAreaConnect
