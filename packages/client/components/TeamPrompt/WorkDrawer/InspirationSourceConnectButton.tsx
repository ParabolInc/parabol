import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {InspirationSourceConnectButton_teamMember$key} from '../../../__generated__/InspirationSourceConnectButton_teamMember.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import connectAzureDevOps from '../../../integrations/azureDevOps/connectAzureDevOps'
import {getConnectProvider} from '../../../integrations/platform/findIntegrationService'
import {Button} from '../../../ui/Button/Button'
import AtlassianClientManager from '../../../utils/AtlassianClientManager'
import GcalClientManager from '../../../utils/GcalClientManager'
import GitHubClientManager from '../../../utils/GitHubClientManager'
import LinearClientManager from '../../../utils/LinearClientManager'
import SendClientSideEvent from '../../../utils/SendClientSideEvent'
import {serviceLabel} from './inspirationCopy'
import type {InspirationSourceService} from './inspirationSources'

interface Props {
  service: InspirationSourceService
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
          ...findIntegrationService_cloudProvider @relay(mask: false)
          ...connectAzureDevOps_service @relay(mask: false)
        }
        integrations {
          atlassian {
            scope
          }
          linear {
            cloudProvider {
              id
              clientId
              serverBaseUrl
            }
          }
          gcal {
            cloudProvider {
              id
              clientId
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {error, onError, submitting} = mutationProps
  const {teamId, services, integrations} = teamMember

  const connect = () => {
    if (service === 'github' || service === 'jira') {
      const provider = getConnectProvider(services, service)
      if (!provider) return onError(new Error(`Could not find the ${serviceLabel(service)} app`))
      if (service === 'github') {
        GitHubClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
      } else {
        AtlassianClientManager.openOAuth(
          atmosphere,
          teamId,
          provider,
          mutationProps,
          AtlassianClientManager.JIRA_SCOPE,
          integrations.atlassian?.scope
        )
      }
    } else if (service === 'linear') {
      const provider = integrations.linear?.cloudProvider
      if (!provider) return onError(new Error('Could not find the Linear app'))
      LinearClientManager.openOAuth(atmosphere, teamId, provider, mutationProps)
    } else if (service === 'azureDevOps') {
      if (!connectAzureDevOps(atmosphere, teamId, services, mutationProps)) {
        return onError(new Error('Could not find the Azure DevOps app'))
      }
    } else if (service === 'gcal') {
      const provider = integrations.gcal?.cloudProvider
      if (!provider) return onError(new Error('Could not find the Google Calendar app'))
      GcalClientManager.openOAuth(atmosphere, provider.id, provider.clientId, teamId, mutationProps)
    }
    SendClientSideEvent(atmosphere, 'Inspiration Drawer Integration Connected', {
      teamId,
      meetingId,
      service
    })
  }

  return (
    <div className='flex flex-col gap-2'>
      <p className='m-0 text-fg-secondary text-sm'>
        Connect {serviceLabel(service)} to draft from your work there.
      </p>
      <Button variant='secondary' size='md' disabled={submitting} onClick={connect}>
        Connect {serviceLabel(service)}
      </Button>
      {error && <div className='text-fg-error text-sm'>{error.message}</div>}
    </div>
  )
}

export default InspirationSourceConnectButton
