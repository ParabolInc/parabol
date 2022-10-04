import graphql from 'babel-plugin-relay/macro'
import React, {useMemo, useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import {SearchMenuItem} from '~/components/SearchMenuItem'
import useEventCallback from '~/hooks/useEventCallback'
import useModal from '~/hooks/useModal'
import useSearchFilter from '~/hooks/useSearchFilter'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import {TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery} from '~/__generated__/TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery.graphql'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import {TaskFooterTeamAssigneeMenuQuery} from '../../../../__generated__/TaskFooterTeamAssigneeMenuQuery.graphql'
import {TaskFooterTeamAssigneeMenu_task$key} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import TaskFooterTeamAssigneeAddIntegrationDialog from './TaskFooterTeamAssigneeAddIntegrationDialog'

const query = graphql`
  query TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery($teamId: ID!) {
    viewer {
      id
      teamMember(teamId: $teamId) {
        id
        integrations {
          id
          atlassian {
            isActive
          }
          github {
            isActive
          }
        }
      }
    }
  }
`

interface Props {
  menuProps: MenuProps
  queryRef: PreloadedQuery<TaskFooterTeamAssigneeMenuQuery>
  task: TaskFooterTeamAssigneeMenu_task$key
}

const gqlQuery = graphql`
  query TaskFooterTeamAssigneeMenuQuery {
    viewer {
      id
      teams {
        id
        name
        teamMembers(sortBy: "preferredName") {
          userId
          preferredName
        }
      }
    }
  }
`

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {menuProps, task: taskRef, queryRef} = props
  const data = usePreloadedQuery<TaskFooterTeamAssigneeMenuQuery>(gqlQuery, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data

  const {closePortal: closeTeamAssigneeMenu} = menuProps
  const {userIds, teamIds} = useUserTaskFilters(viewer.id)

  const task = useFragment(
    graphql`
      fragment TaskFooterTeamAssigneeMenu_task on Task {
        id
        team {
          id
        }
        integration {
          __typename
        }
      }
    `,
    taskRef
  )
  const {team, id: taskId, integration} = task
  const isGitHubTask = integration?.__typename === '_xGitHubIssue'
  const isJiraTask = integration?.__typename === 'JiraIssue'

  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => {
    if (userIds) {
      return teams.filter(
        ({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId))
      )
    }
    if (teamIds) {
      return teams.filter(({id}) => teamIds.includes(id))
    }
    return teams
  }, [teamIds, userIds])
  const taskTeamIdx = useMemo(
    () => assignableTeams.findIndex(({id}) => id === teamId) + 1,
    [teamId, assignableTeams]
  )

  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()

  const onDialogClose = useEventCallback(() => {
    closeTeamAssigneeMenu()
  })
  const {
    modalPortal: addIntegrationModalPortal,
    openPortal: openAddIntegrationPortal,
    closePortal: closeAddIntegrationPortal
  } = useModal({
    onClose: onDialogClose,
    id: 'taskFooterTeamAssigneeAddIntegration',
    parentId: 'taskFooterTeamAssigneeMenu'
  })
  const [newTeam, setNewTeam] = useState({id: '', name: ''})

  const handleAddIntegrationConfirmed = () => {
    closeAddIntegrationPortal()
    if (!newTeam.id) return

    submitMutation()
    ChangeTaskTeamMutation(atmosphere, {taskId, teamId: newTeam.id}, {onError, onCompleted})
    setNewTeam({id: '', name: ''})
    closeTeamAssigneeMenu()
  }
  const handleClose = () => {
    closeAddIntegrationPortal()
    closeTeamAssigneeMenu()
  }

  const handleTaskUpdate = (nextTeam: typeof newTeam) => async () => {
    if (!submitting && teamId !== nextTeam.id) {
      if (isGitHubTask || isJiraTask) {
        const result =
          await atmosphere.fetchQuery<TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery>(query, {
            teamId: nextTeam.id
          })
        const {github, atlassian} = result?.viewer?.teamMember?.integrations ?? {}

        if ((isGitHubTask && !github?.isActive) || (isJiraTask && !atlassian?.isActive)) {
          // viewer is not integrated, now we have these options:
          // 1) if user has integration in source team, then we will use that, but still ask
          // 2) if accessUser is someone else and they have integration for target team, then we will use that without asking
          // 3) else we need to ask the user to integrate with complete oauth flow
          // For now ignore 2) and 3) and just assume it's 1) as that's the most common case.
          setNewTeam(nextTeam)
          openAddIntegrationPortal()
          return
        }
      }
      submitMutation()
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId: nextTeam.id}, {onError, onCompleted})
      closeTeamAssigneeMenu()
    }
  }

  const {
    query: searchQuery,
    filteredItems: matchedAssignableTeams,
    onQueryChange
  } = useSearchFilter(assignableTeams, (team) => team.name)

  return (
    <Menu
      keepParentFocus
      {...menuProps}
      defaultActiveIdx={taskTeamIdx}
      ariaLabel={'Assign this task to another team'}
    >
      <DropdownMenuLabel>Move to:</DropdownMenuLabel>
      {assignableTeams.length > 5 && (
        <SearchMenuItem placeholder='Search teams' onChange={onQueryChange} value={searchQuery} />
      )}
      {query && matchedAssignableTeams.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>No teams found!</EmptyDropdownMenuItemLabel>
      )}
      {matchedAssignableTeams.map((team) => {
        return (
          <MenuItem
            key={team.id}
            label={team.name}
            onClick={handleTaskUpdate(team)}
            noCloseOnClick
          />
        )
      })}
      {(isGitHubTask || isJiraTask) &&
        addIntegrationModalPortal(
          <TaskFooterTeamAssigneeAddIntegrationDialog
            onClose={handleClose}
            onConfirm={handleAddIntegrationConfirmed}
            serviceName={isGitHubTask ? 'GitHub' : 'Jira'}
            teamName={newTeam.name}
          />
        )}
    </Menu>
  )
}

export default TaskFooterTeamAssigneeMenu
