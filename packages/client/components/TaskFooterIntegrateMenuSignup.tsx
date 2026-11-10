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
import ConnectIntegrationMenuItem from './ConnectIntegrationMenuItem'
import LoadingComponent from './LoadingComponent/LoadingComponent'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  label?: string
  orgServices?: readonly TaskClientIntegration[]
  teamMemberRef: TaskFooterIntegrateMenuSignup_teamMember$key
}

const SECTION_TITLE =
  'px-4 pt-2 pb-1 font-semibold text-[11px] text-fg-muted uppercase leading-4 tracking-[.04em]'

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {mutationProps, teamId, label, orgServices = [], teamMemberRef} = props
  const {submitting} = mutationProps
  const teamMember = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_teamMember on TeamMember {
        services {
          service
          title
          isConnected
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
    const {service, isConnected} = integrationService
    if (isConnected || !isTaskClientIntegration(service)) return []
    const [provider] = listServiceProviders(integrationService)
    return provider ? [{integrationService, service, provider}] : []
  })
  const orgItems = orgServices.flatMap(
    (orgService) => connectable.find(({service}) => service === orgService) ?? []
  )
  const otherItems = connectable.filter((item) => !orgItems.includes(item))
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
      {label && (
        <>
          <div className='px-4 pt-2 pb-0 text-[14px] text-fg-secondary'>{label}</div>
          <MenuSeparator />
        </>
      )}
      {orgItems.length > 0 && <div className={SECTION_TITLE}>Used by your organization</div>}
      {orgItems.map(renderItem)}
      {orgItems.length > 0 && otherItems.length > 0 && (
        <div className={SECTION_TITLE}>Other tools</div>
      )}
      {otherItems.map(renderItem)}
    </>
  )
}

export default TaskFooterIntegrateMenuSignup
