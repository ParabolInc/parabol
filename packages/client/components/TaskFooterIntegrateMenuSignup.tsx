import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {TaskFooterIntegrateMenuQuery} from '~/__generated__/TaskFooterIntegrateMenuQuery.graphql'
import {TaskFooterIntegrateMenuSignup_TeamMemberIntegrations$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_TeamMemberIntegrations.graphql'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
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
  featureFlags: TaskFooterIntegrateMenuQuery['response']['viewer']['featureFlags']
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
  const {menuProps, mutationProps, teamId, label, integrationsRef, featureFlags} = props
  const {submitting} = mutationProps
  const integrations = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_TeamMemberIntegrations on TeamMemberIntegrations {
        gitlab {
          ...AddToGitLabMenuItem_GitLabIntegration
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
      {featureFlags.gitlab && (
        <AddToGitLabMenuItem
          mutationProps={mutationProps}
          teamId={teamId}
          gitlabRef={integrations.gitlab}
        />
      )}
    </NarrowMenu>
  )
}

export default TaskFooterIntegrateMenuSignup
