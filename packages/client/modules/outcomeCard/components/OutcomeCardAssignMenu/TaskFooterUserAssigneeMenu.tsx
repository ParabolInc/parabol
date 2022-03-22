import {TaskFooterUserAssigneeMenu_task} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import React, {useMemo} from 'react'
import {createFragmentContainer, usePreloadedQuery, PreloadedQuery} from 'react-relay'
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
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import useSearchFilter from '~/hooks/useSearchFilter'
import {SearchMenuItem} from '~/components/SearchMenuItem'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import {TaskFooterUserAssigneeMenuRootQuery} from '../../../../__generated__/TaskFooterUserAssigneeMenuRootQuery.graphql'

interface Props {
  area: AreaEnum
  menuProps: MenuProps
  queryRef: PreloadedQuery<TaskFooterUserAssigneeMenuRootQuery>
  task: TaskFooterUserAssigneeMenu_task
}

const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, queryRef} = props
  const data = usePreloadedQuery<TaskFooterUserAssigneeMenuRootQuery>(
    graphql`
      query TaskFooterUserAssigneeMenuRootQuery($teamId: ID!) {
        viewer {
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
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data

  const {userId, id: taskId} = task
  const {team} = viewer
  const atmosphere = useAtmosphere()
  const teamMembers = team?.teamMembers || []
  const taskUserIdx = useMemo(
    () => teamMembers.findIndex(({userId}) => userId) + 1,
    [userId, teamMembers]
  )
  const assignees = useMemo(
    () => teamMembers.filter((teamMember) => teamMember.userId !== userId),
    [userId, teamMembers]
  )
  const handleTaskUpdate = (newAssignee) => () => {
    const newUserId = newAssignee.userId === userId ? null : newAssignee.userId
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area}, {})
  }

  const {
    query,
    filteredItems: matchedAssignees,
    onQueryChange
  } = useSearchFilter(assignees, (assignee) => assignee.preferredName)

  if (!team) return null
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Assign this task to a teammate'}
      defaultActiveIdx={userId ? taskUserIdx : undefined}
      {...menuProps}
    >
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.length > 5 && (
        <SearchMenuItem placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedAssignees.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {matchedAssignees.map((assignee) => {
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
