import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {TaskFooterTeamAssignee_task$key} from '../../../../__generated__/TaskFooterTeamAssignee_task.graphql'
import CardButton from '../../../../components/CardButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  canAssign: boolean
  task: TaskFooterTeamAssignee_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterTeamAssigneeMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterTeamAssigneeMenuRoot' */ '../TaskFooterTeamAssigneeMenuRoot'
    )
)

const TaskFooterTeamAssignee = (props: Props) => {
  const {canAssign, task: taskRef, useTaskChild} = props

  const task = useFragment(
    graphql`
      fragment TaskFooterTeamAssignee_task on Task {
        ...TaskFooterTeamAssigneeMenu_task
        team {
          name
        }
      }
    `,
    taskRef
  )

  const {team} = task
  const {name: teamName} = team
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT, {
    id: 'taskFooterTeamAssigneeMenu'
  })
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className='w-full'>
            <CardButton
              className='-ml-2 block h-6 max-w-full truncate rounded-md border-0 px-2 text-left font-semibold text-fg-secondary text-xs leading-6 opacity-100 outline-0 hover:text-fg-primary focus:text-fg-primary'
              aria-label='Assign this task to another team'
              onClick={canAssign ? togglePortal : undefined}
              onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
              ref={originRef}
            >
              <div className='w-fit'>{teamName}</div>
              {teamName}
            </CardButton>
          </div>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Reassign Team</TooltipContent>
      </Tooltip>
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

export default TaskFooterTeamAssignee
