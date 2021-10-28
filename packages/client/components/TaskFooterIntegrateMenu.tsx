import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {TaskFooterIntegrateMenu_task} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '../__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuNoIntegrations from './TaskFooterIntegrateMenuNoIntegrations '
import TaskFooterIntegrateMenuPushAsYou from './TaskFooterIntegrateMenuPushAsYou'
import TaskFooterIntegrateMenuPushOnBehalf from './TaskFooterIntegrateMenuPushOnBehalf'
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

type Integrations = NonNullable<TaskFooterIntegrateMenu_viewer['membership']>['integrations']

const isIntegrated = (integrations: Integrations) => {
  const {atlassian, github} = integrations
  const hasAtlassian = atlassian?.isActive ?? false
  const hasGitHub = github?.isActive ?? false
  return hasAtlassian || hasGitHub
    ? {
        hasAtlassian,
        hasGitHub
      }
    : null
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task, viewer} = props
  const {id: viewerId, membership, teamMember} = viewer
  // not 100% sure how this could be, maybe if we manually deleted a user?
  // https://github.com/ParabolInc/parabol/issues/2980
  if (!teamMember || !membership) return null
  const {integrations: viewerIntegrations, suggestedIntegrations} = membership
  const {integrations: assigneeIntegrations, preferredName} = teamMember
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const isAssigneeIntegrated = isIntegrated(assigneeIntegrations)
  const isViewerIntegrated = isIntegrated(viewerIntegrations)

  if (isAssigneeIntegrated) {
    const placeholder = makePlaceholder(
      isAssigneeIntegrated.hasGitHub,
      isAssigneeIntegrated.hasAtlassian
    )
    return (
      <>
        {!isViewerAssignee && (
          <TaskFooterIntegrateMenuPushOnBehalf
            menuProps={menuProps}
            preferredName={preferredName}
          />
        )}
        <TaskFooterIntegrateMenuList
          menuProps={menuProps}
          mutationProps={mutationProps}
          placeholder={placeholder}
          suggestedIntegrations={suggestedIntegrations}
          task={task}
        />
      </>
    )
  }
  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(
      isViewerIntegrated.hasGitHub,
      isViewerIntegrated.hasAtlassian
    )
    return (
      <>
        <TaskFooterIntegrateMenuPushAsYou menuProps={menuProps} />
        <TaskFooterIntegrateMenuList
          menuProps={menuProps}
          mutationProps={mutationProps}
          placeholder={placeholder}
          suggestedIntegrations={suggestedIntegrations}
          task={task}
        />
      </>
    )
  }
  if (isViewerAssignee) {
    return (
      <TaskFooterIntegrateMenuSignup
        menuProps={menuProps}
        mutationProps={mutationProps}
        teamId={teamId}
      />
    )
  }
  return (
    <>
      <TaskFooterIntegrateMenuNoIntegrations menuProps={menuProps} preferredName={preferredName} />
      <TaskFooterIntegrateMenuSignup
        menuProps={menuProps}
        mutationProps={mutationProps}
        teamId={teamId}
      />
    </>
  )
}

graphql`
  fragment TaskFooterIntegrateMenuViewerAtlassianIntegration on AtlassianIntegration {
    isActive
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerGitHubIntegration on GitHubIntegration {
    isActive
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
        integrations {
          atlassian {
            ...TaskFooterIntegrateMenuViewerAtlassianIntegration @relay(mask: false)
          }
          github {
            ...TaskFooterIntegrateMenuViewerGitHubIntegration @relay(mask: false)
          }
        }
      }
      membership: teamMember(userId: null, teamId: $teamId) {
        integrations {
          atlassian {
            ...TaskFooterIntegrateMenuViewerAtlassianIntegration @relay(mask: false)
          }
          github {
            ...TaskFooterIntegrateMenuViewerGitHubIntegration @relay(mask: false)
          }
        }
        ...TaskFooterIntegrateMenuViewerSuggestedIntegrations @relay(mask: false)
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
