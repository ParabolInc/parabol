import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {TaskFooterIntegrateMenuSignup_TeamMemberIntegrations$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_TeamMemberIntegrations.graphql'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
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

const NarrowMenu = styled(Menu)({
  width: 250
})

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 16px 0'
})

const TaskFooterIntegrateMenuSignup = (props: Props) => {
  const {menuProps, mutationProps, teamId, label, integrationsRef} = props
  const {submitting} = mutationProps
  const integrations = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_TeamMemberIntegrations on TeamMemberIntegrations {
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
    <NarrowMenu ariaLabel={'Integrate with a Service'} {...menuProps}>
      {label && (
        <>
          <Label>{label}</Label>
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
    </NarrowMenu>
  )
}

export default TaskFooterIntegrateMenuSignup
