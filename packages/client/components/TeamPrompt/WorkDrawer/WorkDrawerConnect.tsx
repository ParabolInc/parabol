import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {WorkDrawerConnect_service$key} from '../../../__generated__/WorkDrawerConnect_service.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {getConnectErrorMessage} from '../../../integrations/platform/getConnectErrorMessage'
import {listServiceProviders} from '../../../integrations/platform/integrationServiceProviders'
import {
  getClientIntegration,
  isRegisteredClientIntegration
} from '../../../integrations/platform/registry'
import {cn} from '../../../ui/cn'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  meetingId: string
  teamId: string
  serviceRef: WorkDrawerConnect_service$key
}

const WorkDrawerConnect = (props: Props) => {
  const {meetingId, teamId, serviceRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError} = mutationProps
  const integrationService = useFragment(
    graphql`
      fragment WorkDrawerConnect_service on IntegrationService {
        service
        grantedScopes
        ...integrationServiceProviders_service @relay(mask: false)
      }
    `,
    serviceRef
  )
  const {service, grantedScopes} = integrationService
  if (!isRegisteredClientIntegration(service)) return null
  const definition = getClientIntegration(service)
  const {title} = definition
  const {workDrawer} = definition.capabilities
  if (!workDrawer) return null
  const [provider] = listServiceProviders(integrationService)

  const onConnect = () => {
    if (!provider) return onError(new Error(`Could not find the ${title} app`))
    definition.connect(atmosphere, {teamId, mutationProps, provider, heldScopes: grantedScopes})
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service
    })
  }
  const errorMessage = getConnectErrorMessage(error, definition)

  return (
    <div className='flex flex-col items-center gap-2 pt-12'>
      <div className='h-10 w-10'>
        <definition.Icon className={cn('h-10 w-10', definition.iconClassName)} />
      </div>
      <b>{`Connect to ${title}`}</b>
      <div className='w-1/2 text-center text-sm'>
        {`Connect to ${title} to view your ${workDrawer.connectDescription}.`}
      </div>
      <button
        className='mt-4 cursor-pointer rounded-md bg-sky-500 px-8 py-2 font-semibold text-white hover:bg-sky-600'
        onClick={onConnect}
      >
        Connect
      </button>
      {errorMessage && <div className='text-fg-error'>{errorMessage}</div>}
    </div>
  )
}

export default WorkDrawerConnect
