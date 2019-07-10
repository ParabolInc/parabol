import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import TaskFooterIntegrateMenuList from 'universal/components/TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuNoIntegrations from 'universal/components/TaskFooterIntegrateMenuNoIntegrations '
import TaskFooterIntegrateMenuSignup from 'universal/components/TaskFooterIntegrateMenuSignup'
import {MenuProps} from 'universal/hooks/useMenu'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task
  viewer: TaskFooterIntegrateMenu_viewer
}

const makePlaceholder = (hasGitHub: boolean, hasAtlassian: boolean) => {
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  return `Search ${names.join(' & ')}`
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task, viewer} = props
  const {id: viewerId, userOnTeam} = viewer
  const {atlassianAuth, githubAuth, preferredName, suggestedIntegrations} = userOnTeam!
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const hasAtlassian = !!(atlassianAuth && atlassianAuth.isActive)
  const hasGitHub = !!(githubAuth && githubAuth.isActive)
  const isAssigneeIntegrated = hasAtlassian || hasGitHub
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
  const placeholder = makePlaceholder(hasGitHub, hasAtlassian)
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
