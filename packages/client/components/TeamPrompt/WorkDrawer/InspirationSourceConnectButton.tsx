import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {InspirationSourceConnectButton_teamMember$key} from '../../../__generated__/InspirationSourceConnectButton_teamMember.graphql'
import useConnectIntegrationService from '../../../hooks/useConnectIntegrationService'
import {getClientIntegration} from '../../../integrations/platform/registry'
import {Button} from '../../../ui/Button/Button'
import inspirationServiceLabel from './inspirationServiceLabel'
import type {InspirationSourceService} from './inspirationSources'

interface Props {
  service: Exclude<InspirationSourceService, 'PARABOL'>
  teamMemberRef: InspirationSourceConnectButton_teamMember$key
}

const InspirationSourceConnectButton = (props: Props) => {
  const {service, teamMemberRef} = props
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
  const {teamId, services} = teamMember
  const definition = getClientIntegration(service)
  const {connect, submitting, errorMessage} = useConnectIntegrationService(
    definition,
    services.find((candidate) => candidate.service === service),
    teamId
  )

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
