import type {useConnectIntegrationService_service$key} from '../../../__generated__/useConnectIntegrationService_service.graphql'
import useConnectIntegrationService from '../../../hooks/useConnectIntegrationService'
import type {ClientIntegrationDefinition} from '../../../integrations/platform/ClientIntegrationDefinition'
import {Button} from '../../../ui/Button/Button'

interface Props {
  teamId: string
  definition: ClientIntegrationDefinition
  serviceRef: useConnectIntegrationService_service$key
}

const WorkDrawerConnect = (props: Props) => {
  const {teamId, definition, serviceRef} = props
  const {connect, submitting, errorMessage} = useConnectIntegrationService(
    definition,
    serviceRef,
    teamId
  )
  const {title, capabilities} = definition
  const connectDescription = capabilities.workDrawer?.connectDescription

  return (
    <div className='flex flex-col items-center gap-2 pt-12'>
      <div className='size-10 [&>*]:size-full'>
        <definition.Icon className={definition.iconClassName} />
      </div>
      <b>Connect to {title}</b>
      {connectDescription && (
        <div className='w-1/2 text-center text-sm'>
          Connect to {title} to view your {connectDescription}.
        </div>
      )}
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
