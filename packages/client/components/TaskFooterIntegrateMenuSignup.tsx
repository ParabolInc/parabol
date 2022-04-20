import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import {TaskFooterIntegrateMenuSignup_GitLabIntegration$key} from '~/__generated__/TaskFooterIntegrateMenuSignup_GitLabIntegration.graphql'
import {TaskFooterIntegrateMenu_viewer} from '~/__generated__/TaskFooterIntegrateMenu_viewer.graphql'
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
  gitlabRef: TaskFooterIntegrateMenuSignup_GitLabIntegration$key
  featureFlags: TaskFooterIntegrateMenu_viewer['featureFlags']
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
  const {menuProps, mutationProps, teamId, label, gitlabRef, featureFlags} = props
  const {submitting} = mutationProps
  const gitlab = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuSignup_GitLabIntegration on GitLabIntegration {
        ...AddToGitLabMenuItem_GitLabIntegration
      }
    `,
    gitlabRef
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
        <AddToGitLabMenuItem mutationProps={mutationProps} teamId={teamId} gitlabRef={gitlab} />
      )}
    </NarrowMenu>
  )
}

export default TaskFooterIntegrateMenuSignup
