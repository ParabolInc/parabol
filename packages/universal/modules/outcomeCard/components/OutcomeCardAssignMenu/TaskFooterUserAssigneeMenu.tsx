import {TaskFooterUserAssigneeMenu_task} from '__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import {TaskFooterUserAssigneeMenu_viewer} from '__generated__/TaskFooterUserAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import Menu from 'universal/components/Menu'
import MenuAvatar from 'universal/components/MenuAvatar'
import MenuItem from 'universal/components/MenuItem'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import {MenuProps} from 'universal/hooks/useMenu'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import avatarUser from 'universal/styles/theme/images/avatar-user.svg'
import {AreaEnum} from 'universal/types/graphql'

interface Props {
  area: AreaEnum
  menuProps: MenuProps
  viewer: TaskFooterUserAssigneeMenu_viewer
  task: TaskFooterUserAssigneeMenu_task
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, viewer} = props
  const {assignee, id: taskId} = task
  const {id: assigneeId, userId} = assignee
  const {team} = viewer
  if (!team) return null
  const {teamMembers} = team
  teamMembers.filter((teamMember) => teamMember.id !== assigneeId)
  const assignees = useMemo(
    () => teamMembers.filter((teamMember) => teamMember.id !== assigneeId),
    [assigneeId, teamMembers]
  )
  const atmosphere = useAtmosphere()
  const handleTaskUpdate = (newAssignee) => () => {
    if (userId !== newAssignee.userId) {
      UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newAssignee.userId}, area})
    }
  }

  return (
    <Menu ariaLabel={'Assign this task to a teammate'} {...menuProps}>
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.map((assignee) => {
        return (
          <MenuItem
            key={assignee.id}
            label={
              <MenuItemLabel>
                <MenuAvatar alt={assignee.preferredName} src={assignee.picture || avatarUser} />
                {assignee.preferredName}
              </MenuItemLabel>
            }
            onClick={handleTaskUpdate(assignee)}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(TaskFooterUserAssigneeMenu, {
  viewer: graphql`
    fragment TaskFooterUserAssigneeMenu_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
          userId
        }
      }
    }
  `,
  task: graphql`
    fragment TaskFooterUserAssigneeMenu_task on Task {
      id
      assignee {
        id
        userId
      }
      team {
        id
      }
    }
  `
})
