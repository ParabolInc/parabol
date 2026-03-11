import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
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
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <div
        className='w-full'
        onClick={closeTooltip}
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
      >
        <CardButton
          className='-ml-2 block h-6 max-w-full truncate rounded-full border-0 px-2 text-left font-semibold text-slate-600 text-xs leading-6 opacity-100 outline-0 hover:text-slate-700 focus:text-slate-700'
          aria-label='Assign this task to another team'
          onClick={canAssign ? togglePortal : undefined}
          onMouseEnter={TaskFooterTeamAssigneeMenuRoot.preload}
          ref={originRef}
        >
          <div className='w-fit' ref={tipRef}>
            {teamName}
          </div>
          {teamName}
        </CardButton>
      </div>
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

export default TaskFooterTeamAssignee
