import {TaskFooterTeamAssignee_task} from '../../../../../__generated__/TaskFooterTeamAssignee_task.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer, graphql} from 'react-relay'
import CardButton from '../../../../components/CardButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import textOverflow from '../../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../../styles/paletteV2'
import appTheme from '../../../../styles/theme/theme'
import ui from '../../../../styles/ui'
import lazyPreload from '../../../../utils/lazyPreload'

const TeamToggleButton = styled(CardButton)({
  ...textOverflow,
  borderRadius: ui.borderRadiusSmall,
  color: PALETTE.TEXT_LIGHT,
  display: 'block',
  fontSize: 12,
  fontWeight: 400,
  height: 24,
  lineHeight: '24px',
  marginLeft: -8,
  maxWidth: '100%',
  outline: 0,
  opacity: 1,
  padding: '0 .5rem',
  textAlign: 'left',
  ':hover, :focus': {
    borderColor: appTheme.palette.mid50l,
    color: ui.palette.dark,
    opacity: 1
  }
})

interface Props {
  canAssign: boolean
  task: TaskFooterTeamAssignee_task
  toggleMenuState: () => void
}

const TaskFooterTeamAssigneeMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterTeamAssigneeMenuRoot' */ 'universal/modules/outcomeCard/components/TaskFooterTeamAssigneeMenuRoot')
)

const TaskFooterTeamAssignee = (props: Props) => {
  const {canAssign, task, toggleMenuState} = props
  const {team} = task
  const {name: teamName} = team
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })
  return (
    <>
      <TeamToggleButton
        aria-label='Assign this task to another team'
        onClick={canAssign ? togglePortal : undefined}
        onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
        ref={originRef}
      >
        {teamName}
      </TeamToggleButton>
      {menuPortal(<TaskFooterTeamAssigneeMenuRoot menuProps={menuProps} task={task} />)}
    </>
  )
}

export default createFragmentContainer(TaskFooterTeamAssignee, {
  task: graphql`
    fragment TaskFooterTeamAssignee_task on Task {
      ...TaskFooterTeamAssigneeMenu_task
      team {
        name
      }
    }
  `
})
