import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import connectAzureDevOps from '../../../integrations/azureDevOps/connectAzureDevOps'
import {Button} from '../../../ui/Button/Button'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import AzureDevOpsSVG from '../../AzureDevOpsSVG'

interface Props {
  teamId: string
  meetingId: string
  services: Parameters<typeof connectAzureDevOps>[2]
}

const AzureDevOpsConnectPrompt = (props: Props) => {
  const {teamId, meetingId, services} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError, submitting} = mutationProps
  const connect = () => {
    if (!connectAzureDevOps(atmosphere, teamId, services, mutationProps)) {
      return onError(new Error('Could not find the Azure DevOps app'))
    }
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service: 'azureDevOps'
    })
  }
  return (
    <div className='flex flex-col items-center gap-2 pt-12'>
      <div className='size-10 [&>svg]:size-full'>
        <AzureDevOpsSVG />
      </div>
      <b>Connect to Azure DevOps</b>
      <div className='w-1/2 text-center text-sm'>
        Connect to Azure DevOps to view your work items.
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
      {error && <div className='text-fg-error'>Error: {error.message}</div>}
    </div>
  )
}

export default AzureDevOpsConnectPrompt
