import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuNeedsReconnect_teamMember$key} from '../__generated__/TaskFooterIntegrateMenuNeedsReconnect_teamMember.graphql'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {listServiceProviders} from '../integrations/platform/integrationServiceProviders'
import {
  isTaskClientIntegration,
  listClientIntegrationServices
} from '../integrations/platform/registry'
import type {BeginConnect} from '../integrations/platform/useConnectInMenu'
import menuSectionTitleClass from '../ui/Menu/menuSectionTitleClass'
import ConnectIntegrationMenuItem from './ConnectIntegrationMenuItem'

interface Props {
  onConnect?: BeginConnect
  mutationProps: MenuMutationProps
  teamMemberRef: TaskFooterIntegrateMenuNeedsReconnect_teamMember$key
}

const TaskFooterIntegrateMenuNeedsReconnect = (props: Props) => {
  const {onConnect, mutationProps, teamMemberRef} = props
  const {teamId, services} = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuNeedsReconnect_teamMember on TeamMember {
        teamId
        services {
          service
          title
          isConnected
          expiredAt
          grantedScopes
          ...integrationServiceProviders_service @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const expired = listClientIntegrationServices(services).flatMap(({integrationService}) => {
    const {service, isConnected, expiredAt} = integrationService
    if (isConnected || !expiredAt || !isTaskClientIntegration(service)) return []
    const [provider] = listServiceProviders(integrationService)
    return provider ? [{integrationService, service, provider}] : []
  })
  if (expired.length === 0) return null
  return (
    <>
      <div className={menuSectionTitleClass}>Needs reconnecting</div>
      {expired.map(({integrationService, service, provider}) => (
        <ConnectIntegrationMenuItem
          key={service}
          teamId={teamId}
          mutationProps={mutationProps}
          service={service}
          title={integrationService.title}
          provider={provider}
          heldScopes={integrationService.grantedScopes}
          label={`Reconnect ${integrationService.title}`}
          onConnect={onConnect}
        />
      ))}
    </>
  )
}

export default TaskFooterIntegrateMenuNeedsReconnect
