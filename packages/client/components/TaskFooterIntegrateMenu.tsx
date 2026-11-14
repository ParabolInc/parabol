import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {IntegrationProviderServiceEnum} from '../__generated__/CreateTaskIntegrationMutation.graphql'
import type {TaskFooterIntegrateMenuQuery} from '../__generated__/TaskFooterIntegrateMenuQuery.graphql'
import {makePlaceholder, useIsIntegrated} from '../hooks/useIsIntegrated'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import useConnectInMenu from '../integrations/platform/useConnectInMenu'
import {getOrgSendServices} from '../utils/getSendServices'
import TaskFooterIntegrateMenuConnecting from './TaskFooterIntegrateMenuConnecting'
import TaskFooterIntegrateMenuList from './TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from './TaskFooterIntegrateMenuSignup'

interface Props {
  listLabel?: string
  mutationProps: MenuMutationProps
  queryRef: PreloadedQuery<TaskFooterIntegrateMenuQuery>
  teamId: string
  onPushToIntegration: (
    integrationRepoId: string,
    integrationProviderService: IntegrationProviderServiceEnum
  ) => void
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
  const {
    listLabel = 'Send with your credentials',
    mutationProps,
    queryRef,
    teamId,
    onPushToIntegration
  } = props
  const data = usePreloadedQuery<TaskFooterIntegrateMenuQuery>(query, queryRef)
  const {viewer} = data
  const connectInMenu = useConnectInMenu(mutationProps)
  const {state: connectState} = connectInMenu

  const {viewerTeamMember} = viewer
  const isViewerIntegrated = useIsIntegrated(viewerTeamMember)
  if (!viewerTeamMember) return null

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
    return (
      <TaskFooterIntegrateMenuList
        failure={failure}
        onConnect={connectInMenu.begin}
        mutationProps={mutationProps}
        placeholder={placeholder}
        teamMemberRef={viewerTeamMember}
        onPushToIntegration={onPushToIntegration}
        label={listLabel}
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
