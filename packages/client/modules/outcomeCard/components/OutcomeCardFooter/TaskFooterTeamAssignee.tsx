import {TaskFooterTeamAssignee_task} from '../../../../__generated__/TaskFooterTeamAssignee_task.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import CardButton from '../../../../components/CardButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import textOverflow from '../../../../styles/helpers/textOverflow'
import {PALETTE} from '../../../../styles/paletteV2'
import {Radius} from '../../../../types/constEnums'
import lazyPreload from '../../../../utils/lazyPreload'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import useTooltip from 'hooks/useTooltip'

const TooltipToggle = styled('div')({
  display: 'inline-flex'
})
const TeamToggleButton = styled(CardButton)({
  ...textOverflow,
  borderRadius: Radius.BUTTON_PILL,
  color: PALETTE.TEXT_GRAY,
  display: 'inline-flex',
  fontSize: 12,
  fontWeight: 400,
  height: 24,
  lineHeight: '24px',
  marginLeft: -8,
  maxWidth: '100%',
  outline: 0,
  opacity: 1,
  padding: '0 8px',
  textAlign: 'left',
  ':hover, :focus': {
    color: PALETTE.TEXT_MAIN,
    opacity: 1
  }
})

interface Props {
  canAssign: boolean
  task: TaskFooterTeamAssignee_task
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = lazyPreload(() =>
  import(
    /* webpackChunkName: 'TaskFooterTeamAssigneeMenuRoot' */ '../TaskFooterTeamAssigneeMenuRoot'
  )
)

const TaskFooterTeamAssignee = (props: Props) => {
  const {canAssign, task, useTaskChild} = props
  const {team} = task
  const {name: teamName} = team
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT)
  const {tooltipPortal, openTooltip, closeTooltip, originRef: tipRef} = useTooltip<HTMLDivElement>(
    MenuPosition.UPPER_CENTER
  )
  return (
    <>
      <TooltipToggle onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={tipRef}>
        <TeamToggleButton
          aria-label='Assign this task to another team'
          onClick={canAssign ? togglePortal : undefined}
          onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
          ref={originRef}
        >
          {teamName}
        </TeamToggleButton>
      </TooltipToggle>
      {tooltipPortal(<div>{'Reassign Team'}</div>)}
      {menuPortal(
        <TaskFooterTeamAssigneeMenuRoot
          menuProps={menuProps}
          task={task}
          useTaskChild={useTaskChild}
        />
      )}
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
