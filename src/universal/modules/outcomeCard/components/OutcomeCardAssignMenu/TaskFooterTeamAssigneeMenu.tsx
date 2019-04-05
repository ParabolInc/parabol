import {TaskFooterTeamAssigneeMenu_task} from '__generated__/TaskFooterTeamAssigneeMenu_task.graphql'
import {TaskFooterTeamAssigneeMenu_viewer} from '__generated__/TaskFooterTeamAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import ChangeTaskTeamMutation from 'universal/mutations/ChangeTaskTeamMutation'

const Menu = styled('div')({
  maxHeight: 200
})

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
    const {teamId} = newTeam
    if (teamId !== newTeam.id) {
      ChangeTaskTeamMutation(atmosphere, {taskId, teamId})
    }
  }

  return (
    <Menu>
      <MenuWithShortcuts ariaLabel={'Assign this task to another team'} closePortal={closePortal}>
        <DropdownMenuLabel>Move to:</DropdownMenuLabel>
        {assignableTeams.map((team) => {
          return (
            <MenuItemWithShortcuts
              key={team.id}
              label={team.name}
              onClick={handleTaskUpdate(team)}
            />
          )
        })}
      </MenuWithShortcuts>
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
