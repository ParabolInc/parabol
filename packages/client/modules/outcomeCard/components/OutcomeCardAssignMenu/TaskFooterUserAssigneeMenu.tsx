import {TaskFooterUserAssigneeMenu_task} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import {TaskFooterUserAssigneeMenu_viewer} from '../../../../__generated__/TaskFooterUserAssigneeMenu_viewer.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuAvatar from '../../../../components/MenuAvatar'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import {AreaEnum} from '../../../../types/graphql'

interface Props {
  area: AreaEnum
  menuProps: MenuProps
  viewer: TaskFooterUserAssigneeMenu_viewer
  task: TaskFooterUserAssigneeMenu_task
}

interface Assignee {
  id: string
  picture: string
  preferredName: string
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, viewer} = props
  const {userId, id: taskId} = task
  const {team} = viewer
  const {teamMembers} = team || {teamMembers: []}
  const assignees = useMemo(() => {
    if (!userId) return teamMembers as Assignee[]
    const taskAssignee = teamMembers.find((teamMember) => teamMember.userId === userId)
    const otherTeamMembers = teamMembers.filter((teamMember) => teamMember.userId !== userId)

    return [taskAssignee, ...otherTeamMembers] as Assignee[]
  }, [userId, teamMembers])
  const atmosphere = useAtmosphere()
  if (!team) return null
  const handleTaskUpdate = (newAssignee) => () => {
    const newUserId = newAssignee.userId === userId ? null : newAssignee.userId
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area})
  }

  return (
    <Menu
      ariaLabel={'Assign this task to a teammate'}
      defaultActiveIdx={userId ? 1 : undefined}
      {...menuProps}
    >
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.map((teamMember) => {
        return (
          <MenuItem
            key={teamMember.id}
            label={
              <MenuItemLabel>
                <MenuAvatar alt={teamMember.preferredName} src={teamMember.picture || avatarUser} />
                {teamMember.preferredName}
              </MenuItemLabel>
            }
            onClick={handleTaskUpdate(teamMember)}
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
      userId
      team {
        id
      }
    }
  `
})
