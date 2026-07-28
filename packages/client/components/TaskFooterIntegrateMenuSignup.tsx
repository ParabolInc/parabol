import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskFooterIntegrateMenuSignup_TeamMemberIntegrations$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_TeamMemberIntegrations.graphql'
import type {MenuProps} from '../hooks/useMenu'
import type {MenuMutationProps} from '../hooks/useMutationProps'
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
  integrationsRef: TaskFooterIntegrateMenuSignup_TeamMemberIntegrations$key
}

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {menuProps, mutationProps, teamId, label, integrationsRef} = props
  const {submitting} = mutationProps
  const integrations = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_TeamMemberIntegrations on TeamMemberIntegrations {
        atlassian {
          # fetched so openOAuth's held-scope union can see them in the store
          isActive
          hasJiraScopes
          hasConfluenceScopes
        }
        gitlab {
          ...AddToGitLabMenuItem_GitLabIntegration
        }
        azureDevOps {
          ...AddToAzureMenuItem_AzureIntegration
        }
      }
    `,
    integrationsRef
  )

  if (submitting) return <LoadingComponent spinnerSize={24} height={24} showAfter={0} width={200} />
  return (
    <Menu className='w-[250px]' ariaLabel={'Integrate with a Service'} {...menuProps}>
      {label && (
        <>
          <div className='px-4 pt-2 pb-0 text-[14px] text-fg-secondary'>{label}</div>
          <MenuItemHR />
        </>
      )}
      <AddToGitHubMenuItem mutationProps={mutationProps} teamId={teamId} />
      <AddToJiraMenuItem mutationProps={mutationProps} teamId={teamId} />
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
