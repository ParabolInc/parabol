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
import {useUserTaskFilters} from '~/utils/useUserTaskFilters'

interface Props {
  area: AreaEnum
  menuProps: MenuProps
  viewer: TaskFooterUserAssigneeMenu_viewer
  task: TaskFooterUserAssigneeMenu_task
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, viewer} = props
  const {userIds} = useUserTaskFilters(viewer.id)
  console.log('TaskFooterUserAssigneeMenu -> userIds', userIds)
  const {userId, id: taskId} = task
  const {team} = viewer
  const {teamMembers} = team || {teamMembers: []}
  console.log('TaskFooterUserAssigneeMenu -> teamMembers', teamMembers)
  // const assignees = useMemo(
  //   () =>
  //     teamMembers.filter(
  //       (teamMember) =>
  //         teamMember.userId !== userId && (!userIds || !userIds.includes(teamMember.userId))
  //     ),
  //   [userId, teamMembers]
  // )
  const assignees = useMemo(
    () => teamMembers.filter((teamMember) => !userIds || !userIds.includes(teamMember.userId)),
    [userId, teamMembers]
  )
  const taskUserIdx = useMemo(() => assignees.map(({userId}) => userId).indexOf(userId) + 1, [
    userId,
    assignees
  ])
  console.log('TaskFooterUserAssigneeMenu -> assignees', assignees)
  const atmosphere = useAtmosphere()
  if (!team) return null
  const handleTaskUpdate = (newAssignee) => () => {
    const newUserId = newAssignee.userId === userId ? null : newAssignee.userId
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area})
  }

  return (
    <Menu
      ariaLabel={'Assign this task to a teammate'}
      defaultActiveIdx={userId ? taskUserIdx : undefined}
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
      id
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
