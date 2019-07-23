import {TaskFooterUserAssignee_task} from '__generated__/TaskFooterUserAssignee_task.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import BaseButton from 'universal/components/BaseButton'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import textOverflow from 'universal/styles/helpers/textOverflow'
import avatarUser from 'universal/styles/theme/images/avatar-user.svg'
import appTheme from 'universal/styles/theme/theme'
import ui from 'universal/styles/ui'
import lazyPreload from 'universal/utils/lazyPreload'

const label = {
  ...textOverflow,
  color: ui.colorText,
  display: 'block',
  flex: 1,
  fontSize: appTheme.typography.s1,
  fontWeight: 400,
  lineHeight: '24px',
  maxWidth: '100%',
  textAlign: 'left'
}

const AvatarButton = styled(BaseButton)({
  border: 0,
  boxShadow: 'none',
  display: 'flex',
  fontSize: 'inherit',
  height: 24,
  lineHeight: 'inherit',
  outline: 0,
  padding: 0,
  maxWidth: '100%',
  ':hover,:focus,:active': {
    boxShadow: 'none'
  },
  ':hover > div,:focus > div': {
    borderColor: appTheme.palette.dark,
    color: appTheme.palette.dark10d
  }
})

const Avatar = styled('div')<{cardIsActive: boolean}>(({cardIsActive}) => ({
  backgroundColor: 'transparent',
  border: '.0625rem solid transparent',
  borderColor: cardIsActive && appTheme.palette.mid50l,
  borderRadius: '100%',
  height: '1.75rem',
  marginLeft: '-.125rem',
  marginRight: '.25rem',
  padding: '.0625rem',
  position: 'relative',
  top: '-.125rem',
  width: '1.75rem'
}))

const AvatarImage = styled('img')({
  borderRadius: '100%',
  height: 24,
  marginRight: 4,
  width: 24
})

const AvatarLabel = styled('div')({
  ...label,
  flex: 1,
  minWidth: 0
})

interface Props {
  area: string
  canAssign: boolean
  cardIsActive: boolean
  task: TaskFooterUserAssignee_task
  toggleMenuState: () => void
}

const TaskFooterUserAssigneeMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterUserAssigneeMenuRoot' */ 'universal/modules/outcomeCard/components/TaskFooterUserAssigneeMenuRoot')
)

const TaskFooterUserAssignee = (props: Props) => {
  const {area, canAssign, cardIsActive, task, toggleMenuState} = props
  const {assignee} = task
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })
  return (
    <>
      <AvatarButton
        aria-label='Assign this task to a teammate'
        onClick={canAssign ? togglePortal : undefined}
        onMouseEnter={TaskFooterUserAssigneeMenuRoot.preload}
        ref={originRef}
      >
        <Avatar cardIsActive={cardIsActive}>
          <AvatarImage alt={assignee.preferredName} src={assignee.picture || avatarUser} />
        </Avatar>
        <AvatarLabel>{assignee.preferredName}</AvatarLabel>
      </AvatarButton>
      {menuPortal(<TaskFooterUserAssigneeMenuRoot menuProps={menuProps} task={task} area={area} />)}
    </>
  )
}

export default createFragmentContainer(TaskFooterUserAssignee, {
  task: graphql`
    fragment TaskFooterUserAssignee_task on Task {
      ...TaskFooterUserAssigneeMenuRoot_task
      assignee {
        ... on TeamMember {
          picture
        }
        preferredName
      }
      team {
        name
      }
    }
  `
})
