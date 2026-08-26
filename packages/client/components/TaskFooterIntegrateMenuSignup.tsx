import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuSignup_teamMember$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_teamMember.graphql'
import type {MenuProps} from '../hooks/useMenu'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {getConnectProvider} from '../integrations/platform/findIntegrationService'
import AddToAzureMenuItem from './AddToAzureMenuItem'
import AddToGitHubMenuItem from './AddToGitHubMenuItem'
import AddToGitLabMenuItem from './AddToGitLabMenuItem'
import AddToJiraMenuItem from './AddToJiraMenuItem'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  teamId: string
  label?: string
  teamMemberRef: TaskFooterIntegrateMenuSignup_teamMember$key
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {menuProps, mutationProps, teamId, label, teamMemberRef} = props
  const {submitting} = mutationProps
  const teamMember = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_teamMember on TeamMember {
        services {
          ...findIntegrationService_cloudProvider @relay(mask: false)
        }
        integrations {
          atlassian {
            isActive
            scope
          }
          gitlab {
            ...AddToGitLabMenuItem_GitLabIntegration
          }
          azureDevOps {
            ...AddToAzureMenuItem_AzureIntegration
          }
        }
      }
    `,
    teamMemberRef
  )
  const {integrations, services} = teamMember

  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  return (
    <Menu className='w-[250px]' ariaLabel={'Integrate with a Service'} {...menuProps}>
      {label && (
        <>
          <div className='px-4 pt-2 pb-0 text-[14px] text-fg-secondary'>{label}</div>
          <MenuItemHR />
        </>
      )}
      <AddToGitHubMenuItem
        mutationProps={mutationProps}
        teamId={teamId}
        provider={getConnectProvider(services, 'github')}
      />
      <AddToJiraMenuItem
        mutationProps={mutationProps}
        teamId={teamId}
        provider={getConnectProvider(services, 'jira')}
        heldScopes={integrations.atlassian?.scope}
      />
      <AddToAzureMenuItem
        mutationProps={mutationProps}
        teamId={teamId}
        azureRef={integrations.azureDevOps}
      />
      <AddToGitLabMenuItem
        mutationProps={mutationProps}
        teamId={teamId}
        gitlabRef={integrations.gitlab}
      />
    </Menu>
  )
}

export default TaskFooterIntegrateMenuSignup
