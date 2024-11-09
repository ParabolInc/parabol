import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {TaskServiceEnum} from '../../../../../__generated__/CreateTaskMutation.graphql'
import {ExportAllTasksMenuQuery} from '../../../../../__generated__/ExportAllTasksMenuQuery.graphql'
import {ExportAllTasksMenu_meeting$key} from '../../../../../__generated__/ExportAllTasksMenu_meeting.graphql'
import TaskFooterIntegrateMenuList from '../../../../../components/TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from '../../../../../components/TaskFooterIntegrateMenuSignup'
import {makePlaceholder, useIsIntegrated} from '../../../../../hooks/useIsIntegrated'
import {MenuProps} from '../../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../../hooks/useMutationProps'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  meetingRef: ExportAllTasksMenu_meeting$key
  queryRef: PreloadedQuery<ExportAllTasksMenuQuery>
  handlePushToIntegration: (
    integrationRepoId: string,
    integrationProviderService: Exclude<TaskServiceEnum, 'PARABOL'>,
    integrationLabel?: string
  ) => void
}

const query = graphql`
  query ExportAllTasksMenuQuery($teamId: ID!) {
    viewer {
      id
      viewerTeamMember: teamMember(userId: null, teamId: $teamId) {
        integrations {
          ...useIsIntegrated_integrations
          ...TaskFooterIntegrateMenuSignup_TeamMemberIntegrations
        }
      }
    }
  }
`

graphql`
  fragment ExportAllTasksMenu_meetingTasks on Task {
    id
    integration {
      id
    }
  }
`

const ExportAllTasksMenu = (props: Props) => {
  const {menuProps, mutationProps, meetingRef, queryRef, handlePushToIntegration} = props
  const data = usePreloadedQuery<ExportAllTasksMenuQuery>(query, queryRef)
  const {viewer} = data
  const meeting = useFragment(
    graphql`
      fragment ExportAllTasksMenu_meeting on NewMeeting {
        teamId
        ... on RetrospectiveMeeting {
          tasks {
            ...ExportAllTasksMenu_meetingTasks @relay(mask: false)
          }
        }
        ... on ActionMeeting {
          tasks {
            ...ExportAllTasksMenu_meetingTasks @relay(mask: false)
          }
        }
        ... on TeamPromptMeeting {
          tasks {
            ...ExportAllTasksMenu_meetingTasks @relay(mask: false)
          }
        }
      }
    `,
    meetingRef
  )

  const {viewerTeamMember} = viewer
  const {teamId, tasks} = meeting
  const isViewerIntegrated = useIsIntegrated(viewerTeamMember?.integrations)

  if (!viewerTeamMember) return null
  const {integrations: viewerIntegrations} = viewerTeamMember

  const filteredTasks = tasks?.filter((task) => !task.integration)

  if (!filteredTasks || filteredTasks.length === 0) {
    return null
  }

  if (isViewerIntegrated) {
    const placeholder = makePlaceholder(isViewerIntegrated)
    const label = 'Push with your credentials'
    return (
      <TaskFooterIntegrateMenuList
        menuProps={menuProps}
        placeholder={placeholder}
        teamId={teamId}
        onPushToIntegration={handlePushToIntegration}
        label={label}
      />
    )
  }

  const label = "You don't have any integrations for this team yet."

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

export default ExportAllTasksMenu
