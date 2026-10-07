import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {InspirationSourceConnectButton_teamMember$key} from '../../../__generated__/InspirationSourceConnectButton_teamMember.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {getConnectErrorMessage} from '../../../integrations/platform/getConnectErrorMessage'
import {listServiceProviders} from '../../../integrations/platform/integrationServiceProviders'
import {getClientIntegration} from '../../../integrations/platform/registry'
import {Button} from '../../../ui/Button/Button'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import inspirationServiceLabel from './inspirationServiceLabel'
import type {InspirationSourceService} from './inspirationSources'

interface Props {
  service: Exclude<InspirationSourceService, 'PARABOL'>
  meetingId: string
  teamMemberRef: InspirationSourceConnectButton_teamMember$key
}

const InspirationSourceConnectButton = (props: Props) => {
  const {service, meetingId, teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment InspirationSourceConnectButton_teamMember on TeamMember {
        teamId
        services {
          service
          grantedScopes
          ...integrationServiceProviders_service @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError, submitting} = mutationProps
  const {teamId, services} = teamMember
  const definition = getClientIntegration(service)

  const connect = () => {
    const integrationService = services.find((candidate) => candidate.service === service)
    const [provider] = integrationService ? listServiceProviders(integrationService) : []
    if (!integrationService || !provider) {
      return onError(new Error(`Could not find the ${inspirationServiceLabel(service)} app`))
    }
    definition.connect(atmosphere, {
      teamId,
      mutationProps,
      provider,
      heldScopes: integrationService.grantedScopes
    })
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service
    })
  }
  const errorMessage = getConnectErrorMessage(error, definition)

  return (
    <div className='flex flex-col gap-2'>
      <p className='m-0 text-fg-secondary text-sm'>
        Connect {inspirationServiceLabel(service)} to draft from your work there.
      </p>
      <Button variant='secondary' size='md' disabled={submitting} onClick={connect}>
        Connect {inspirationServiceLabel(service)}
      </Button>
      {errorMessage && <div className='text-fg-error text-sm'>{errorMessage}</div>}
    </div>
  )
}

export default InspirationSourceConnectButton
