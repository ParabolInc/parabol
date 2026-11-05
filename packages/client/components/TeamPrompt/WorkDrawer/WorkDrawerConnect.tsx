import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {WorkDrawerConnect_service$key} from '../../../__generated__/WorkDrawerConnect_service.graphql'
import useConnectIntegrationService from '../../../hooks/useConnectIntegrationService'
import type {ClientIntegrationDefinition} from '../../../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../../../ui/Button/Button'

interface Props {
  teamId: string
  definition: ClientIntegrationDefinition
  connectDescription: string
  serviceRef: WorkDrawerConnect_service$key
}

const WorkDrawerConnect = (props: Props) => {
  const {teamId, definition, connectDescription, serviceRef} = props
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
  const {title} = definition

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
        onClick={connect}
      >
        Connect
      </Button>
      {errorMessage && <div className='text-fg-error'>{errorMessage}</div>}
    </div>
  )
}

export default WorkDrawerConnect
