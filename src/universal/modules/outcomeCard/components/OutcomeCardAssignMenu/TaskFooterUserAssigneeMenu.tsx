import {TaskFooterUserAssigneeMenu_task} from '__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import {TaskFooterUserAssigneeMenu_viewer} from '__generated__/TaskFooterUserAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import DropdownMenuLabel from 'universal/components/DropdownMenuLabel'
import MenuItemWithShortcuts from 'universal/components/MenuItemWithShortcuts'
import MenuWithShortcuts from 'universal/components/MenuWithShortcuts'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import avatarUser from 'universal/styles/theme/images/avatar-user.svg'

const Menu = styled('div')({
  maxHeight: 200
})

interface Props {
  area: string
  closePortal: () => void
  viewer: TaskFooterUserAssigneeMenu_viewer
  task: TaskFooterUserAssigneeMenu_task
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, closePortal, task, viewer} = props
  const {assignee, id: taskId} = task
  const {id: assigneeId} = assignee
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
    if (assigneeId !== newAssignee.id) {
      UpdateTaskMutation(atmosphere, {id: taskId, assigneeId: newAssignee.id}, area)
    }
  }

  return (
    <Menu>
      <MenuWithShortcuts ariaLabel={'Assign this task to a teammate'} closePortal={closePortal}>
        <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
        {assignees.map((assignee) => {
          return (
            <MenuItemWithShortcuts
              key={assignee.id}
              avatar={assignee.picture || avatarUser}
              label={assignee.preferredName}
              onClick={handleTaskUpdate(assignee)}
            />
          )
        })}
      </MenuWithShortcuts>
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterUserAssigneeMenu,
  graphql`
    fragment TaskFooterUserAssigneeMenu_viewer on User {
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
      }
    }

    fragment TaskFooterUserAssigneeMenu_task on Task {
      id
      assignee {
        id
      }
      team {
        id
      }
    }
  `
)
