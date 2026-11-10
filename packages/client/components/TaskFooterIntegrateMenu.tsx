import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskFooterIntegrateMenu_task$key} from '../__generated__/TaskFooterIntegrateMenu_task.graphql'
import type {TaskFooterIntegrateMenuQuery} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import {makePlaceholder, useIsIntegrated} from '../hooks/useIsIntegrated'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import CreateTaskIntegrationMutation from '../mutations/CreateTaskIntegrationMutation'
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
        ...useIsIntegrated_teamMember
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

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(isViewerIntegrated)
    const label = 'Send with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        placeholder={placeholder}
        teamId={task.teamId}
        onPushToIntegration={handlePushToIntegration}
        label={label}
      />
    )
  }

  const label = "You don't have any integrations for this team yet."

  return (
    <TaskFooterIntegrateMenuSignup
      mutationProps={mutationProps}
      teamId={teamId}
      label={label}
      teamMemberRef={viewerTeamMember}
    />
  )
}

export default TaskFooterIntegrateMenu
