import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import {SearchMenuItem} from '~/components/SearchMenuItem'
import useSearchFilter from '~/hooks/useSearchFilter'
import {TaskFooterUserAssigneeMenuQuery} from '../../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import {TaskFooterUserAssigneeMenu_task$key} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import Menu from '../../../../components/Menu'
import MenuAvatar from '../../../../components/MenuAvatar'
import MenuItem from '../../../../components/MenuItem'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'

const StyledPreferredName = styled('div')({
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden'
})
interface Props {
  area: AreaEnum
  menuProps: MenuProps
  queryRef: PreloadedQuery<TaskFooterUserAssigneeMenuQuery>
  task: TaskFooterUserAssigneeMenu_task$key
}

const gqlQuery = graphql`
  query TaskFooterUserAssigneeMenuQuery($teamId: ID!) {
    viewer {
      id
      team(teamId: $teamId) {
        teamId: id
        teamMembers(sortBy: "preferredName") {
          id
          user {
            id
            picture
            preferredName
          }
        }
      }
    }
  }
`
const TaskFooterUserAssigneeMenu = (props: Props) => {
  const {area, menuProps, task: taskRef, queryRef} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterUserAssigneeMenu_task on Task {
        id
        userId
        team {
          id
        }
      }
    `,
    taskRef
  )
  const data = usePreloadedQuery<TaskFooterUserAssigneeMenuQuery>(gqlQuery, queryRef)
  const {viewer} = data

  const {userId, id: taskId} = task
  const {team} = viewer
  const atmosphere = useAtmosphere()
  const teamMembers = team?.teamMembers || []
  const taskUserIdx = useMemo(
    () => teamMembers.findIndex(({user}) => user.id === userId) + 1,
    [userId, teamMembers]
  )
  const assignees = useMemo(
    () => teamMembers.filter(({user}) => user.id !== userId),
    [userId, teamMembers]
  )
  const handleTaskUpdate = (newAssignee: {user: {id: string}}) => () => {
    const newUserId = newAssignee.user.id === userId ? null : newAssignee.user.id
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, userId: newUserId}, area}, {})
  }

  const {
    query,
    filteredItems: matchedAssignees,
    onQueryChange
  } = useSearchFilter(assignees, (assignee) => assignee.user.preferredName)

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
                <MenuAvatar
                  alt={assignee.user.preferredName}
                  src={assignee.user.picture || avatarUser}
                />
                <StyledPreferredName>{assignee.user.preferredName}</StyledPreferredName>
              </MenuItemLabel>
            }
            onClick={handleTaskUpdate(assignee)}
          />
        )
      })}
    </Menu>
  )
}

export default TaskFooterUserAssigneeMenu
