import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {TaskFooterIntegrateMenu_task} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '../__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuNoIntegrations from './TaskFooterIntegrateMenuNoIntegrations '
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

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
  const {id: viewerId, teamMember} = viewer
  // not 100% sure how this could be, maybe if we manually deleted a user?
  // https://github.com/ParabolInc/parabol/issues/2980
  if (!teamMember) return null
  const {atlassianAuth, githubAuth, preferredName, suggestedIntegrations} = teamMember
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
  fragment TaskFooterIntegrateMenuViewerAtlassianAuth on TeamMember {
    atlassianAuth {
      isActive
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerGitHubAuth on TeamMember {
      githubAuth {
        isActive
      }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerSuggestedIntegrations on TeamMember {
    suggestedIntegrations {
      ...TaskFooterIntegrateMenuList_suggestedIntegrations
    }
  }
`

export default createFragmentContainer(TaskFooterIntegrateMenu, {
  viewer: graphql`
    fragment TaskFooterIntegrateMenu_viewer on User {
      id
      teamMember(userId: $userId, teamId: $teamId) {
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
