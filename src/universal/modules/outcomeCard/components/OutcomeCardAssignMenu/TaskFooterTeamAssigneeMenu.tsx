import {TaskFooterTeamAssigneeMenu_task} from '__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import {TaskFooterTeamAssigneeMenu_viewer} from '__generated__/TaskFooterTeamAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import ChangeTaskTeamMutation from 'universal/mutations/ChangeTaskTeamMutation'

interface Props {
  closePortal: () => void
  viewer: TaskFooterTeamAssigneeMenu_viewer
  task: TaskFooterTeamAssigneeMenu_task
}

const TaskFooterTeamAssigneeMenu = (props: Props) => {
  const {closePortal, task, viewer} = props
  const {team, id: taskId} = task
  const {id: teamId} = team
  const {teams} = viewer
  const assignableTeams = useMemo(() => teams.filter((team) => team.id !== teamId), [teamId, teams])
  const atmosphere = useAtmosphere()
  const handleTaskUpdate = (newTeam) => () => {
    if (teamId !== newTeam.id) {
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId: newTeam.id})
    }
  }

  return (
    <Menu ariaLabel={'Assign this task to another team'} closePortal={closePortal}>
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
