import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {InspirationSourceConnectButton_teamMember$key} from '../../../__generated__/InspirationSourceConnectButton_teamMember.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useConnectIntegrationService from '../../../hooks/useConnectIntegrationService'
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
  const {teamId, services} = teamMember
  const definition = getClientIntegration(service)
  const {connect, submitting, errorMessage} = useConnectIntegrationService(
    definition,
    services.find((candidate) => candidate.service === service),
    teamId
  )

  const onConnect = () => {
    if (!connect()) return
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service
    })
  }

  return (
    <div className='flex flex-col gap-2'>
      <p className='m-0 text-fg-secondary text-sm'>
        Connect {inspirationServiceLabel(service)} to draft from your work there.
      </p>
      <Button variant='secondary' size='md' disabled={submitting} onClick={onConnect}>
        Connect {inspirationServiceLabel(service)}
      </Button>
      {errorMessage && <div className='text-fg-error text-sm'>{errorMessage}</div>}
    </div>
  )
}

export default InspirationSourceConnectButton
