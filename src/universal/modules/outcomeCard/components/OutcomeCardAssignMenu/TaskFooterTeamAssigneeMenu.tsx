import {TaskFooterTeamAssigneeMenu_task} from '__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import {TaskFooterTeamAssigneeMenu_viewer} from '__generated__/TaskFooterTeamAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import ChangeTaskTeamMutation from 'universal/mutations/ChangeTaskTeamMutation'
import useMutationProps from 'universal/hooks/useMutationProps'

interface Props {
  menuProps: MenuProps
  viewer: TaskFooterTeamAssigneeMenu_viewer
  task: TaskFooterTeamAssigneeMenu_task
}

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {menuProps, task, viewer} = props
  const {team, id: taskId} = task
  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => teams.filter((team) => team.id !== teamId), [teamId, teams])
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const handleTaskUpdate = (newTeam) => () => {
    if (!submitting && teamId !== newTeam.id) {
      submitMutation()
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId: newTeam.id}, {onError, onCompleted})
    }
  }

  return (
    <Menu {...menuProps} ariaLabel={'Assign this task to another team'}>
      <DropdownMenuLabel>Move to:</DropdownMenuLabel>
      {assignableTeams.map((team) => {
        return <MenuItem key={team.id} label={team.name} onClick={handleTaskUpdate(team)} />
      })}
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterTeamAssigneeMenu,
  graphql`
    fragment TaskFooterTeamAssigneeMenu_viewer on User {
      teams {
        id
        name
      }
    }

    fragment TaskFooterTeamAssigneeMenu_task on Task {
      id
      team {
        id
      }
    }
  `
)
