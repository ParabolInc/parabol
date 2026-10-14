import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {WorkDrawerConnect_service$key} from '../../../__generated__/WorkDrawerConnect_service.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useConnectIntegrationService from '../../../hooks/useConnectIntegrationService'
import type {ClientIntegrationDefinition} from '../../../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../../../ui/Button/Button'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'

interface Props {
  meetingId: string
  teamId: string
  definition: ClientIntegrationDefinition
  connectDescription: string
  serviceRef: WorkDrawerConnect_service$key
}

const WorkDrawerConnect = (props: Props) => {
  const {meetingId, teamId, definition, connectDescription, serviceRef} = props
  const atmosphere = useAtmosphere()
  const integrationService = useFragment(
    graphql`
      fragment WorkDrawerConnect_service on IntegrationService {
        grantedScopes
        ...integrationServiceProviders_service @relay(mask: false)
      }
    `,
    serviceRef
  )
  const {connect, submitting, errorMessage} = useConnectIntegrationService(
    definition,
    integrationService,
    teamId
  )
  const {service, title} = definition

  const onConnect = () => {
    if (!connect()) return
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service
    })
  }

  return (
    <div className='flex flex-col items-center gap-2 pt-12'>
      <div className='size-10 [&>*]:size-full'>
        <definition.Icon className={definition.iconClassName} />
      </div>
      <b>Connect to {title}</b>
      <div className='w-1/2 text-center text-sm'>
        Connect to {title} to view your {connectDescription}.
      </div>
      <Button
        variant='secondary'
        size='md'
        className='mt-4 px-8'
        disabled={submitting}
        onClick={onConnect}
      >
        Connect
      </Button>
      {errorMessage && <div className='text-fg-error'>{errorMessage}</div>}
    </div>
  )
}

export default WorkDrawerConnect
