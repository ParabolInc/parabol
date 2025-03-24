import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import {TaskFooterIntegrateMenuQuery} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {makePlaceholder, useIsIntegrated} from '../hooks/useIsIntegrated'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import CreateTaskIntegrationMutation from '../mutations/CreateTaskIntegrationMutation'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task$key
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery>
}

const query = graphql`
  query TaskFooterIntegrateMenuQuery($teamId: ID!, $userId: ID!) {
    viewer {
      id
      assigneeTeamMember: teamMember(userId: $userId, teamId: $teamId) {
        user {
          preferredName
        }
        prevUsedRepoIntegrations(first: 1) {
          items {
            id
          }
        }
        integrations {
          ...useIsIntegrated_integrations
          ...TaskFooterIntegrateMenuSignup_TeamMemberIntegrations
        }
      }
      viewerTeamMember: teamMember(userId: null, teamId: $teamId) {
        integrations {
          ...useIsIntegrated_integrations
          ...TaskFooterIntegrateMenuSignup_TeamMemberIntegrations
        }
      }
    }
  }
`

const TaskFooterIntegrateMenu = (props: Props) => {
  const {menuProps, mutationProps, task: taskRef, queryRef} = props
  const data = usePreloadedQuery<TaskFooterIntegrateMenuQuery>(query, queryRef)
  const {viewer} = data
  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenu_task on Task {
        id
        teamId
        userId
      }
    `,
    taskRef
  )
  const atmosphere = useAtmosphere()

  const {id: viewerId, viewerTeamMember, assigneeTeamMember} = viewer
  const isViewerIntegrated = useIsIntegrated(viewerTeamMember?.integrations)
  const isAssigneeIntegrated = useIsIntegrated(assigneeTeamMember?.integrations)
  if (!assigneeTeamMember || !viewerTeamMember) return null
  const {integrations: viewerIntegrations} = viewerTeamMember
  const {user: assigneeUser, prevUsedRepoIntegrations} = assigneeTeamMember
  const {preferredName: assigneeName} = assigneeUser
  const {teamId, userId, id: taskId} = task
  const isViewerAssignee = viewerId === userId
  const showAssigneeIntegrations = !!(
    isAssigneeIntegrated && prevUsedRepoIntegrations.items?.length
  )
  const {submitMutation, onError, onCompleted} = mutationProps

  const handlePushToIntegration = (
    integrationRepoId: string,
    integrationProviderService: IntegrationProviderServiceEnum
  ) => {
    const variables = {
      integrationRepoId,
      taskId: taskId,
      integrationProviderService: integrationProviderService
    }
    submitMutation()
    CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
  }

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(isViewerIntegrated)
    const label = 'Push with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        placeholder={placeholder}
        teamId={task.teamId}
        onPushToIntegration={handlePushToIntegration}
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
        placeholder={placeholder}
        teamId={task.teamId}
        onPushToIntegration={handlePushToIntegration}
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

export default TaskFooterIntegrateMenu
