import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuSignup_teamMember$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_teamMember.graphql'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {getConnectProvider} from '../integrations/platform/findIntegrationService'
import {isRegisteredClientIntegration} from '../integrations/platform/registry'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import ConnectIntegrationMenuItem from './ConnectIntegrationMenuItem'
import LoadingComponent from './LoadingComponent/LoadingComponent'

interface Props {
  mutationProps: MenuMutationProps
  teamId: string
  label?: string
  teamMemberRef: TaskFooterIntegrateMenuSignup_teamMember$key
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {mutationProps, teamId, label, teamMemberRef} = props
  const {submitting} = mutationProps
  const teamMember = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_teamMember on TeamMember {
        services {
          title
          isConnected
          grantedScopes
          ...findIntegrationService_cloudProvider @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const {services} = teamMember

  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  return (
    <>
      {label && (
        <>
          <div className='px-4 pt-2 pb-0 text-[14px] text-fg-secondary'>{label}</div>
          <MenuSeparator />
        </>
      )}
      {services.map(({service, title, isConnected, grantedScopes}) => {
        if (isConnected || !isRegisteredClientIntegration(service)) return null
        const provider = getConnectProvider(services, service)
        if (!provider) return null
        return (
          <ConnectIntegrationMenuItem
            key={service}
            teamId={teamId}
            mutationProps={mutationProps}
            service={service}
            title={title}
            provider={provider}
            heldScopes={grantedScopes}
          />
        )
      })}
    </>
  )
}

export default TaskFooterIntegrateMenuSignup
