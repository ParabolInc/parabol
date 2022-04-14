import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {
  TaskFooterIntegrateMenu_viewer,
  TaskFooterIntegrateMenu_viewer$key
} from '../__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task$key
  viewer: TaskFooterIntegrateMenu_viewer$key
}

const makePlaceholder = (hasGitHub: boolean, hasAtlassian: boolean, hasAzureDevOps: boolean) => {
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  if (hasAzureDevOps) names.push('Azure DevOps')
  return `Search ${names.join(' & ')}`
}

type Integrations = NonNullable<TaskFooterIntegrateMenu_viewer['viewerTeamMember']>['integrations']

const isIntegrated = (integrations: Integrations) => {
  const {atlassian, github, jiraServer, azureDevOps} = integrations
  const hasAtlassian = atlassian?.isActive ?? false
  const hasGitHub = github?.isActive ?? false
  const hasAzureDevOps = azureDevOps?.auth?.isActive ?? false
  const hasJiraServer = jiraServer.auth?.isActive ?? false
  return hasAtlassian || hasGitHub || hasJiraServer || hasAzureDevOps
    ? {
        hasAtlassian,
        hasGitHub,
        hasJiraServer,
        hasAzureDevOps
      }
    : null
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task: taskRef, viewer: viewerRef} = props

  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenu_task on Task {
        ...TaskFooterIntegrateMenuList_task
        teamId
        userId
      }
    `,
    taskRef
  )
  const viewer = useFragment(
    graphql`
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
    viewerRef
  )

  const {id: viewerId, viewerTeamMember, assigneeTeamMember} = viewer
  if (!assigneeTeamMember || !viewerTeamMember) return null
  const {integrations: viewerIntegrations, repoIntegrations: viewerRepoIntegrations} =
    viewerTeamMember
  const {
    integrations: assigneeIntegrations,
    repoIntegrations: assigneeRepoIntegrations,
    preferredName: assigneeName
  } = assigneeTeamMember
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const isViewerIntegrated = isIntegrated(viewerIntegrations)
  const isAssigneeIntegrated = isIntegrated(assigneeIntegrations)

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(
      isViewerIntegrated.hasGitHub,
      isViewerIntegrated.hasAtlassian,
      isViewerIntegrated.hasAzureDevOps
    )
    const label = 'Push with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        mutationProps={mutationProps}
        placeholder={placeholder}
        repoIntegrations={viewerRepoIntegrations}
        task={task}
        label={label}
      />
    )
  }

  if (isAssigneeIntegrated) {
    const placeholder = makePlaceholder(
      isAssigneeIntegrated.hasGitHub,
      isAssigneeIntegrated.hasAtlassian,
      isAssigneeIntegrated.hasAzureDevOps
    )
    const label = isViewerAssignee ? undefined : `Push as ${assigneeName}`
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        mutationProps={mutationProps}
        placeholder={placeholder}
        repoIntegrations={assigneeRepoIntegrations}
        task={task}
        label={label}
      />
    )
  }
  const label = isViewerAssignee
    ? "You don't have any integrations for this team yet."
    : `Neither you nor ${assigneeName} has any integrations for this team.`

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
  fragment TaskFooterIntegrateMenuViewerJiraServerIntegration on JiraServerIntegration {
    auth {
      isActive
    }
  }
`
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
  fragment TaskFooterIntegrateMenuViewerAzureDevOpsIntegration on AzureDevOpsIntegration {
    auth {
      isActive
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuViewerRepoIntegrations on TeamMember {
    repoIntegrations {
      ...TaskFooterIntegrateMenuList_repoIntegrations
    }
  }
`

graphql`
  fragment TaskFooterIntegrateMenuTeamMemberIntegrations on TeamMember {
    integrations {
      jiraServer {
        ...TaskFooterIntegrateMenuViewerJiraServerIntegration @relay(mask: false)
      }
      atlassian {
        ...TaskFooterIntegrateMenuViewerAtlassianIntegration @relay(mask: false)
      }
      github {
        ...TaskFooterIntegrateMenuViewerGitHubIntegration @relay(mask: false)
      }
      azureDevOps {
        ...TaskFooterIntegrateMenuViewerAzureDevOpsIntegration @relay(mask: false)
      }
    }
    ...TaskFooterIntegrateMenuViewerRepoIntegrations @relay(mask: false)
  }
`

export default TaskFooterIntegrateMenu
