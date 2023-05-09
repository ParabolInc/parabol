import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {MenuProps} from '../../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../../hooks/useMutationProps'
import {ExportAllTasksMenuQuery} from '../../../../../__generated__/ExportAllTasksMenuQuery.graphql'
import {ExportAllTasksMenu_meeting$key} from '../../../../../__generated__/ExportAllTasksMenu_meeting.graphql'
import TaskFooterIntegrateMenuList from '../../../../../components/TaskFooterIntegrateMenuList'
import TaskFooterIntegrateMenuSignup from '../../../../../components/TaskFooterIntegrateMenuSignup'
import useAtmosphere from '../../../../../hooks/useAtmosphere'
import {IntegrationProviderServiceEnum} from '../../../../../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import CreateTaskIntegrationMutation from '../../../../../mutations/CreateTaskIntegrationMutation'
import {useIsIntegrated, makePlaceholder} from '../../../../../hooks/useIsIntegrated'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  meetingRef: ExportAllTasksMenu_meeting$key
  queryRef: PreloadedQuery<ExportAllTasksMenuQuery>
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

const ExportAllTasksMenu = (props: Props) => {
  const {menuProps, mutationProps, meetingRef, queryRef} = props
  const data = usePreloadedQuery<ExportAllTasksMenuQuery>(query, queryRef)
  const {viewer} = data
  const meeting = useFragment(
    graphql`
      fragment ExportAllTasksMenu_meeting on NewMeeting {
        teamId
        ... on RetrospectiveMeeting {
          tasks {
            id
            integration {
              id
            }
          }
        }
        ... on ActionMeeting {
          tasks {
            id
            integration {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()

  const {viewerTeamMember} = viewer
  const {teamId, tasks} = meeting
  const isViewerIntegrated = useIsIntegrated(viewerTeamMember?.integrations)

  if (!viewerTeamMember) return null
  const {integrations: viewerIntegrations} = viewerTeamMember

  const {onError, onCompleted} = mutationProps

  const filteredTasks = tasks?.filter((task) => !task.integration)

  if (!filteredTasks || filteredTasks.length === 0) {
    return null
  }

  const handlePushToIntegration = (
    integrationRepoId: string,
    integrationProviderService: IntegrationProviderServiceEnum
  ) => {
    filteredTasks?.forEach((task) => {
      const variables = {
        integrationRepoId,
        taskId: task.id,
        integrationProviderService: integrationProviderService
      }
      CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
    })
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
