import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {TaskFooterIntegrateMenu_task} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '../__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
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

type Integrations = NonNullable<TaskFooterIntegrateMenu_viewer['viewerTeamMember']>['integrations']

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
  const {id: viewerId, viewerTeamMember, assigneeTeamMember} = viewer
  // not 100% sure how this could be, maybe if we manually deleted a user?
  // https://github.com/ParabolInc/parabol/issues/2980
  if (!assigneeTeamMember || !viewerTeamMember) return null
  const {
    integrations: viewerIntegrations,
    suggestedIntegrations: viewerSuggestedIntegrations
  } = viewerTeamMember
  const {
    integrations: assigneeIntegrations,
    suggestedIntegrations: assigneeSuggestedIntegrations,
    preferredName: assigneeName
  } = assigneeTeamMember
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const isViewerIntegrated = isIntegrated(viewerIntegrations)
  const isAssigneeIntegrated = isIntegrated(assigneeIntegrations)

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(
      isViewerIntegrated.hasGitHub,
      isViewerIntegrated.hasAtlassian
    )
    const label = 'Push with your credentials.'
    return (
      <>
        <TaskFooterIntegrateMenuList
          menuProps={menuProps}
          mutationProps={mutationProps}
          placeholder={placeholder}
          suggestedIntegrations={viewerSuggestedIntegrations}
          task={task}
          label={label}
        />
      </>
    )
  }

  if (isAssigneeIntegrated) {
    const placeholder = makePlaceholder(
      isAssigneeIntegrated.hasGitHub,
      isAssigneeIntegrated.hasAtlassian
    )
    const label = isViewerAssignee ? undefined : `Push as ${assigneeName}.`
    return (
      <>
        <TaskFooterIntegrateMenuList
          menuProps={menuProps}
          mutationProps={mutationProps}
          placeholder={placeholder}
          suggestedIntegrations={assigneeSuggestedIntegrations}
          task={task}
          label={label}
        />
      </>
    )
  }
  const label =
    assigneeTeamMember && !isViewerAssignee
      ? `Neither you nor ${assigneeName} has any integrations for this team.`
      : "You don't have any integrations for this team yet."

  return (
    <TaskFooterIntegrateMenuSignup
      menuProps={menuProps}
      mutationProps={mutationProps}
      teamId={teamId}
      label={label}
    />
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

graphql`
  fragment TaskFooterIntegrateMenuTeamMemberIntegrations on TeamMember {
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
`

export default createFragmentContainer(TaskFooterIntegrateMenu, {
  viewer: graphql`
    fragment TaskFooterIntegrateMenu_viewer on User {
      id
      assigneeTeamMember: teamMember(userId: $userId, teamId: $teamId) {
        preferredName
        ...TaskFooterIntegrateMenuTeamMemberIntegrations @relay(mask: false)
      }
      viewerTeamMember: teamMember(userId: null, teamId: $teamId) {
        ...TaskFooterIntegrateMenuTeamMemberIntegrations @relay(mask: false)
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
