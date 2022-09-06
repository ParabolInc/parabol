import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
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

  //FIXME i18n: Search team members
  const {t} = useTranslation()

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
      ariaLabel={t('TaskFooterUserAssigneeMenu.AssignThisTaskToATeammate')}
      defaultActiveIdx={userId ? taskUserIdx : undefined}
      {...menuProps}
    >
      <DropdownMenuLabel>{t('TaskFooterUserAssigneeMenu.AssignTo:')}</DropdownMenuLabel>
      {assignees.length > 5 && (
        <SearchMenuItem placeholder='Search team members' onChange={onQueryChange} value={query} />
      )}
      {query && matchedAssignees.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          {t('TaskFooterUserAssigneeMenu.NoTeamMembersFound!')}
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
