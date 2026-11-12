import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import type {TaskFooterIntegrateMenuQuery} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {makePlaceholder, useIsIntegrated} from '../hooks/useIsIntegrated'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import useConnectInMenu from '../integrations/platform/useConnectInMenu'
import CreateTaskIntegrationMutation from '../mutations/CreateTaskIntegrationMutation'
import {getOrgSendServices} from '../utils/getSendServices'
import TaskFooterIntegrateMenuConnecting from './TaskFooterIntegrateMenuConnecting'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  mutationProps: MenuMutationProps
  task: TaskFooterIntegrateMenu_task$key
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery>
}

const query = graphql`
  query TaskFooterIntegrateMenuQuery($teamId: ID!) @raw_response_type {
    viewer {
      viewerTeamMember: teamMember(userId: null, teamId: $teamId) {
        ...TaskFooterIntegrateMenuSignup_teamMember
        ...TaskFooterIntegrateMenuList_teamMember
        ...useIsIntegrated_teamMember
      }
      team(teamId: $teamId) {
        recentOrgTaskCounts {
          service
          taskCount
        }
      }
    }
  }
`

const TaskFooterIntegrateMenu = (props: Props) => {
  const {mutationProps, task: taskRef, queryRef} = props
  const data = usePreloadedQuery<TaskFooterIntegrateMenuQuery>(query, queryRef)
  const {viewer} = data
  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenu_task on Task {
        id
        teamId
      }
    `,
    taskRef
  )
  const atmosphere = useAtmosphere()
  const connectInMenu = useConnectInMenu(mutationProps)
  const {state: connectState} = connectInMenu

  const {viewerTeamMember} = viewer
  const isViewerIntegrated = useIsIntegrated(viewerTeamMember)
  if (!viewerTeamMember) return null
  const {teamId, id: taskId} = task
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
    CreateTaskIntegrationMutation(atmosphere, variables, {
      onError,
      onCompleted
    })
  }

  if (connectState.phase === 'waiting') {
    return (
      <TaskFooterIntegrateMenuConnecting
        title={connectState.title}
        onCancel={connectInMenu.cancel}
      />
    )
  }
  const failure = connectState.phase === 'failed' ? connectState : undefined

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(isViewerIntegrated)
    const label = 'Send with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        failure={failure}
        onConnect={connectInMenu.begin}
        mutationProps={mutationProps}
        placeholder={placeholder}
        teamMemberRef={viewerTeamMember}
        onPushToIntegration={handlePushToIntegration}
        label={label}
      />
    )
  }

  const label = "You don't have any integrations for this team yet."

  return (
    <TaskFooterIntegrateMenuSignup
      failure={failure}
      onConnect={connectInMenu.begin}
      mutationProps={mutationProps}
      teamId={teamId}
      label={label}
      orgServices={getOrgSendServices(viewer.team?.recentOrgTaskCounts ?? [])}
      teamMemberRef={viewerTeamMember}
    />
  )
}

export default TaskFooterIntegrateMenu
