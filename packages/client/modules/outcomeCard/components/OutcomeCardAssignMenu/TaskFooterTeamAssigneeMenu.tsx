import {TaskFooterTeamAssigneeMenu_task} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import {TaskFooterTeamAssigneeMenu_viewer} from '../../../../__generated__/TaskFooterTeamAssigneeMenu_viewer.graphql'
import React, {useMemo, useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import ChangeTaskTeamMutation from '../../../../mutations/ChangeTaskTeamMutation'
import useMutationProps from '../../../../hooks/useMutationProps'
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'
import {TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery} from '~/__generated__/TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery.graphql'
import useModal from '~/hooks/useModal'
import TaskFooterTeamAssigneeAddGitHubDialog from './TaskFooterTeamAssigneeAddGitHubDialog'
import TaskFooterTeamAssigneeAddJiraDialog from './TaskFooterTeamAssigneeAddJiraDialog'
import useEventCallback from '~/hooks/useEventCallback'

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
  viewer: TaskFooterTeamAssigneeMenu_viewer
  task: TaskFooterTeamAssigneeMenu_task
}

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {menuProps, task, viewer} = props
  const {closePortal: closeTeamAssigneeMenu} = menuProps
  const {userIds, teamIds} = useUserTaskFilters(viewer.id)
  const {team, id: taskId, integration} = task
  const isGitHubTask = integration?.__typename === '_xGitHubIssue'
  const isJiraTask = integration?.__typename === 'JiraIssue'

  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => {
    const filteredTeams = userIds
      ? teams.filter(({teamMembers}) => !!teamMembers.find(({userId}) => userIds.includes(userId)))
      : teamIds
      ? teams.filter(({id}) => teamIds.includes(id))
      : teams
    return filteredTeams
  }, [teamIds, userIds])
  const taskTeamIdx = useMemo(() => assignableTeams.findIndex(({id}) => id === teamId) + 1, [
    teamId,
    assignableTeams
  ])

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

  const handleIntegrationAdded = () => {
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
      setNewTeam(nextTeam)
      if (isGitHubTask || isJiraTask) {
        const result = await atmosphere.fetchQuery<
          TaskFooterTeamAssigneeMenu_viewerIntegrationsQuery
        >(query, {
          teamId: nextTeam.id
        })
        const {github, atlassian} = result?.viewer?.teamMember?.integrations ?? {}

        if ((isGitHubTask && !github?.isActive) || (isJiraTask && !atlassian?.isActive)) {
          openAddIntegrationPortal()
          return
        }
      }
      submitMutation()
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId: nextTeam.id}, {onError, onCompleted})
      closeTeamAssigneeMenu()
    }
  }

  return (
    <Menu
      {...menuProps}
      defaultActiveIdx={taskTeamIdx}
      ariaLabel={'Assign this task to another team'}
    >
      <DropdownMenuLabel>Move to:</DropdownMenuLabel>
      {assignableTeams.map((team) => {
        return (
          <MenuItem
            key={team.id}
            label={team.name}
            onClick={handleTaskUpdate(team)}
            noCloseOnClick
          />
        )
      })}
      {addIntegrationModalPortal(
        isGitHubTask ? (
          <TaskFooterTeamAssigneeAddGitHubDialog
            onClose={handleClose}
            onIntegrationAdded={handleIntegrationAdded}
            teamId={newTeam.id}
            teamName={newTeam.name}
          />
        ) : isJiraTask ? (
          <TaskFooterTeamAssigneeAddJiraDialog
            onClose={handleClose}
            onIntegrationAdded={handleIntegrationAdded}
            teamId={newTeam.id}
            teamName={newTeam.name}
          />
        ) : (
          undefined
        )
      )}
    </Menu>
  )
}

export default createFragmentContainer(TaskFooterTeamAssigneeMenu, {
  viewer: graphql`
    fragment TaskFooterTeamAssigneeMenu_viewer on User {
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
  `,
  task: graphql`
    fragment TaskFooterTeamAssigneeMenu_task on Task {
      id
      team {
        id
      }
      integration {
        __typename
      }
    }
  `
})
