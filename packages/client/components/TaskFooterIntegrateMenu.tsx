import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {
  TaskFooterIntegrateMenuQuery,
  TaskFooterIntegrateMenuQueryResponse
} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task$key
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery>
}

type IntegrationLookup = {
  hasGitHub: boolean
  hasAtlassian: boolean
  hasGitLab: boolean
  hasJiraServer: boolean
  hasAzureDevOps: boolean
}

const makePlaceholder = (integrationLookup: IntegrationLookup) => {
  const {hasGitHub, hasAtlassian, hasGitLab, hasAzureDevOps} = integrationLookup
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  if (hasGitLab) names.push('GitLab')
  if (hasAzureDevOps) names.push('Azure DevOps')
  return `Search ${names.join(' & ')}`
}

type Integrations = NonNullable<
  TaskFooterIntegrateMenuQueryResponse['viewer']['viewerTeamMember']
>['integrations']

const isIntegrated = (integrations: Integrations) => {
  const {atlassian, github, jiraServer, gitlab, azureDevOps} = integrations
  const hasAtlassian = atlassian?.isActive ?? false
  const hasGitHub = github?.isActive ?? false
  const hasGitLab = gitlab?.auth?.isActive ?? false
  const hasJiraServer = jiraServer?.auth?.isActive ?? false
  const hasAzureDevOps = azureDevOps?.auth?.isActive ?? false
  return hasAtlassian || hasGitHub || hasJiraServer || hasGitLab || hasAzureDevOps
    ? {
        hasAtlassian,
        hasGitHub,
        hasJiraServer,
        hasGitLab,
        hasAzureDevOps
      }
    : null
}

const query = graphql`
  query TaskFooterIntegrateMenuQuery($teamId: ID!, $userId: ID!) {
    viewer {
      id
      assigneeTeamMember: teamMember(userId: $userId, teamId: $teamId) {
        preferredName
        prevUsedRepoIntegrations(first: 1) {
          items {
            id
          }
        }
        ...TaskFooterIntegrateMenuTeamMemberIntegrations @relay(mask: false)
      }
      viewerTeamMember: teamMember(userId: null, teamId: $teamId) {
        ...TaskFooterIntegrateMenuTeamMemberIntegrations @relay(mask: false)
      }
    }
  }
`

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task: taskRef, queryRef} = props
  const data = usePreloadedQuery<TaskFooterIntegrateMenuQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
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

  const {id: viewerId, viewerTeamMember, assigneeTeamMember} = viewer
  if (!assigneeTeamMember || !viewerTeamMember) return null
  const {integrations: viewerIntegrations} = viewerTeamMember
  const {
    integrations: assigneeIntegrations,
    preferredName: assigneeName,
    prevUsedRepoIntegrations
  } = assigneeTeamMember
  const {teamId, userId} = task
  const isViewerAssignee = viewerId === userId
  const isViewerIntegrated = isIntegrated(viewerIntegrations)
  const isAssigneeIntegrated = isIntegrated(assigneeIntegrations)
  const showAssigneeIntegrations = !!(
    isAssigneeIntegrated && prevUsedRepoIntegrations.items?.length
  )
  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(isViewerIntegrated)
    const label = 'Push with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        mutationProps={mutationProps}
        placeholder={placeholder}
        task={task}
        label={label}
      />
    )
  }

  if (showAssigneeIntegrations) {
    const placeholder = makePlaceholder(isAssigneeIntegrated)
    const label = isViewerAssignee ? undefined : `Push as ${assigneeName}`
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        mutationProps={mutationProps}
        placeholder={placeholder}
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
      integrationsRef={viewerIntegrations}
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
  fragment TaskFooterIntegrateMenuViewerGitLabIntegration on GitLabIntegration {
    auth {
      isActive
    }
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
  fragment TaskFooterIntegrateMenuTeamMemberIntegrations on TeamMember {
    integrations {
      ...TaskFooterIntegrateMenuSignup_TeamMemberIntegrations
      jiraServer {
        ...TaskFooterIntegrateMenuViewerJiraServerIntegration @relay(mask: false)
      }
      atlassian {
        ...TaskFooterIntegrateMenuViewerAtlassianIntegration @relay(mask: false)
      }
      github {
        ...TaskFooterIntegrateMenuViewerGitHubIntegration @relay(mask: false)
      }
      gitlab {
        ...TaskFooterIntegrateMenuViewerGitLabIntegration @relay(mask: false)
      }
      azureDevOps {
        ...TaskFooterIntegrateMenuViewerAzureDevOpsIntegration @relay(mask: false)
      }
    }
  }
`

export default TaskFooterIntegrateMenu
