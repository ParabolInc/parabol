import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import {
  TaskFooterIntegrateMenuQuery,
  TaskFooterIntegrateMenuQueryResponse
} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task$key
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery>
}

const makePlaceholder = (hasGitHub: boolean, hasAtlassian: boolean) => {
  const names = [] as string[]
  if (hasGitHub) names.push('GitHub')
  if (hasAtlassian) names.push('Jira')
  return `Search ${names.join(' & ')}`
}

type Integrations = NonNullable<
  TaskFooterIntegrateMenuQueryResponse['viewer']['viewerTeamMember']
>['integrations']

const isIntegrated = (integrations: Integrations) => {
  const {atlassian, github, jiraServer} = integrations
  const hasAtlassian = atlassian?.isActive ?? false
  const hasGitHub = github?.isActive ?? false
  const hasJiraServer = jiraServer.auth?.isActive ?? false
  return hasAtlassian || hasGitHub || hasJiraServer
    ? {
        hasAtlassian,
        hasGitHub,
        hasJiraServer
      }
    : null
}

const query = graphql`
  query TaskFooterIntegrateMenuQuery($teamId: ID!, $userId: ID!) {
    viewer {
      id
      assigneeTeamMember: teamMember(userId: $userId, teamId: $teamId) {
        preferredName
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
      isViewerIntegrated.hasAtlassian
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
      isAssigneeIntegrated.hasAtlassian
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
    }
    ...TaskFooterIntegrateMenuViewerRepoIntegrations @relay(mask: false)
  }
`

export default TaskFooterIntegrateMenu
