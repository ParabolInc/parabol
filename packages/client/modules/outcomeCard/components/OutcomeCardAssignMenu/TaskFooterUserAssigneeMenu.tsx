import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer, PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import {SearchMenuItem} from '~/components/SearchMenuItem'
import useSearchFilter from '~/hooks/useSearchFilter'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuAvatar from '../../../../components/MenuAvatar'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import {TaskFooterUserAssigneeMenuQuery} from '../../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import {TaskFooterUserAssigneeMenu_task} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'

const StyledPreferredName = styled('div')({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
})
interface Props {
  area: AreaEnum
  menuProps: MenuProps
  queryRef: PreloadedQuery<TaskFooterUserAssigneeMenuQuery>
  task: TaskFooterUserAssigneeMenu_task
}

const gqlQuery = graphql`
  query TaskFooterUserAssigneeMenuQuery($teamId: ID!) {
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
`
const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task, queryRef} = props
  const data = usePreloadedQuery<TaskFooterUserAssigneeMenuQuery>(gqlQuery, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
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
  const handleTaskUpdate = (newAssignee: {userId: string}) => () => {
    const newUserId = newAssignee.userId === userId ? null : newAssignee.userId
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area}, {})
  }

  const {
    query,
    filteredItems: matchedAssignees,
    onQueryChange
  } = useSearchFilter(assignees, (assignee) => assignee.preferredName)

  if (!team) return null

  const showSearch = assignees.length > 5

  return (
    <Menu
      keepParentFocus={showSearch}
      ariaLabel={'Assign this task to a teammate'}
      defaultActiveIdx={userId ? taskUserIdx : undefined}
      {...menuProps}
    >
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {showSearch && (
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
                <StyledPreferredName>{assignee.preferredName}</StyledPreferredName>
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
