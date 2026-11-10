import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuSignup_teamMember$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_teamMember.graphql'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {listServiceProviders} from '../integrations/platform/integrationServiceProviders'
import {
  isTaskClientIntegration,
  listClientIntegrationServices,
  type TaskClientIntegration
} from '../integrations/platform/registry'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import menuSectionTitleClass from '../ui/Menu/menuSectionTitleClass'
import ConnectIntegrationMenuItem from './ConnectIntegrationMenuItem'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import TaskFooterIntegrateMenuNeedsReconnect from './TaskFooterIntegrateMenuNeedsReconnect'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  label?: string
  orgServices?: readonly TaskClientIntegration[]
  teamMemberRef: TaskFooterIntegrateMenuSignup_teamMember$key
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {mutationProps, teamId, label, orgServices = [], teamMemberRef} = props
  const {submitting} = mutationProps
  const teamMember = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_teamMember on TeamMember {
        ...TaskFooterIntegrateMenuNeedsReconnect_teamMember
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
  const {services} = teamMember

  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  const connectable = listClientIntegrationServices(services).flatMap(({integrationService}) => {
    const {service, isConnected, expiredAt} = integrationService
    if (isConnected || expiredAt || !isTaskClientIntegration(service)) return []
    const [provider] = listServiceProviders(integrationService)
    return provider ? [{integrationService, service, provider}] : []
  })
  const orgItems = orgServices.flatMap(
    (orgService) => connectable.find(({service}) => service === orgService) ?? []
  )
  const otherItems = connectable.filter((item) => !orgItems.includes(item))
  const hasExpired = services.some(
    ({service, isConnected, expiredAt}) =>
      !isConnected && !!expiredAt && isTaskClientIntegration(service)
  )
  const shownLabel = hasExpired ? 'Reconnect a tool to send this task.' : label
  const renderItem = ({integrationService, service, provider}: (typeof connectable)[number]) => (
    <ConnectIntegrationMenuItem
      key={service}
      teamId={teamId}
      mutationProps={mutationProps}
      service={service}
      title={integrationService.title}
      provider={provider}
      heldScopes={integrationService.grantedScopes}
    />
  )
  return (
    <>
      {shownLabel && (
        <>
          <div className='px-4 pt-2 pb-0 text-[14px] text-fg-secondary'>{shownLabel}</div>
          <MenuSeparator />
        </>
      )}
      <TaskFooterIntegrateMenuNeedsReconnect
        mutationProps={mutationProps}
        teamMemberRef={teamMember}
      />
      {orgItems.length > 0 && (
        <div className={menuSectionTitleClass}>Used by your organization</div>
      )}
      {orgItems.map(renderItem)}
      {(orgItems.length > 0 || hasExpired) && otherItems.length > 0 && (
        <div className={menuSectionTitleClass}>Other tools</div>
      )}
      {otherItems.map(renderItem)}
    </>
  )
}

export default TaskFooterIntegrateMenuSignup
