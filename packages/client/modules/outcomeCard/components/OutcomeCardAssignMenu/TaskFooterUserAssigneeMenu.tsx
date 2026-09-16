import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import type {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {EmptyDropdownMenuItemLabel} from '~/components/EmptyDropdownMenuItemLabel'
import useSearchFilter from '~/hooks/useSearchFilter'
import type {TaskFooterUserAssigneeMenu_task$key} from '../../../../__generated__/TaskFooterUserAssigneeMenu_task.graphql'
import type {TaskFooterUserAssigneeMenuQuery} from '../../../../__generated__/TaskFooterUserAssigneeMenuQuery.graphql'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import MenuAvatar from '../../../../components/MenuAvatar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import {MenuSearch} from '../../../../ui/Menu/MenuSearch'

interface Props {
  area: AreaEnum
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
  const {area, task: taskRef, queryRef} = props
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
    <>
      <DropdownMenuLabel>Assign to:</DropdownMenuLabel>
      {assignees.length > 5 && (
        <MenuSearch placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedAssignees.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No team members found!
        </EmptyDropdownMenuItemLabel>
      )}
      {matchedAssignees.map((assignee) => {
        return (
          <MenuItem key={assignee.id} onClick={handleTaskUpdate(assignee)}>
            <MenuAvatar
              alt={assignee.user.preferredName}
              src={assignee.user.picture || avatarUser}
            />
            <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
              {assignee.user.preferredName}
            </div>
          </MenuItem>
        )
      })}
    </>
  )
}

export default TaskFooterUserAssigneeMenu
