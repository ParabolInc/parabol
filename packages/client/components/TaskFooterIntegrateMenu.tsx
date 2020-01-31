import {TaskFooterIntegrateMenu_task} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '../__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuNoIntegrations from './TaskFooterIntegrateMenuNoIntegrations '
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task
  viewer: TaskFooterIntegrateMenu_viewer
}

const makePlaceholder = (hasGitHub: boolean, hasAtlassian: boolean, hasAzureDevops: boolean) => {
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  if (hasAzureDevops) names.push('AzureDevops')
  return `Search ${names.slice(0, -1).join(' , ') + ' & ' + names.slice(-1)}`
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task, viewer} = props
  const {id: viewerId, userOnTeam} = viewer
  // not 100% sure how this could be, maybe if we manually deleted a user?
  // https://github.com/ParabolInc/action/issues/2980
  if (!userOnTeam) return null
  const {
    atlassianAuth,
    azureDevopsAuth,
    githubAuth,
    preferredName,
    suggestedIntegrations
  } = userOnTeam
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const hasAtlassian = !!(atlassianAuth && atlassianAuth.isActive)
  const hasAzureDevops = !!(azureDevopsAuth && azureDevopsAuth.isActive)
  const hasGitHub = !!(githubAuth && githubAuth.isActive)
  const isAssigneeIntegrated = hasAtlassian || hasAzureDevops || hasGitHub
  if (!isAssigneeIntegrated) {
    return isViewerAssignee ? (
      <TaskFooterIntegrateMenuSignup
        menuProps={menuProps}
        mutationProps={mutationProps}
        teamId={teamId}
      />
    ) : (
      <TaskFooterIntegrateMenuNoIntegrations menuProps={menuProps} preferredName={preferredName} />
    )
  }
  const placeholder = makePlaceholder(hasGitHub, hasAtlassian, hasAzureDevops)
  return (
    <TaskFooterIntegrateMenuList
      menuProps={menuProps}
      mutationProps={mutationProps}
      placeholder={placeholder}
      suggestedIntegrations={suggestedIntegrations}
      task={task}
    />
  )
}

graphql`
  fragment TaskFooterIntegrateMenuViewerAtlassianAuth on User {
    atlassianAuth(teamId: $teamId) {
      isActive
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerAzureDevopsAuth on User {
    azureDevopsAuth(teamId: $teamId) {
      isActive
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerGitHubAuth on User {
    githubAuth(teamId: $teamId) {
      isActive
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerSuggestedIntegrations on User {
    suggestedIntegrations(teamId: $teamId) {
      ...TaskFooterIntegrateMenuList_suggestedIntegrations
    }
  }
`

export default createFragmentContainer(TaskFooterIntegrateMenu, {
  viewer: graphql`
    fragment TaskFooterIntegrateMenu_viewer on User {
      id
      userOnTeam(userId: $userId) {
        preferredName
        ...TaskFooterIntegrateMenuViewerAtlassianAuth @relay(mask: false)
        ...TaskFooterIntegrateMenuViewerAzureDevopsAuth @relay(mask: false)
        ...TaskFooterIntegrateMenuViewerSuggestedIntegrations @relay(mask: false)
        ...TaskFooterIntegrateMenuViewerGitHubAuth @relay(mask: false)
      }
    }
  `,
  task: graphql`
    fragment TaskFooterIntegrateMenu_task on Task {
      ...TaskFooterIntegrateMenuList_task
      teamId
      userId
    }
  `
})
