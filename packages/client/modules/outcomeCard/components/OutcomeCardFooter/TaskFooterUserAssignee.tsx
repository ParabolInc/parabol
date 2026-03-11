import {AssignmentInd as AssignmentIndIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useTooltip from '~/hooks/useTooltip'
import {cn} from '~/ui/cn'
import type {TaskFooterUserAssignee_task$key} from '../../../../__generated__/TaskFooterUserAssignee_task.graphql'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  area: string
  canAssign: boolean
  task: TaskFooterUserAssignee_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterUserAssigneeMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterUserAssigneeMenuRoot' */ '../TaskFooterUserAssigneeMenuRoot'
    )
)

const TaskFooterUserAssignee = (props: Props) => {
  const {area, canAssign, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterUserAssignee_task on Task {
        ...TaskFooterUserAssigneeMenuRoot_task
        user {
          picture
          preferredName
        }
        team {
          name
        }
      }
    `,
    taskRef
  )
  const {user} = task
  const userImage = user?.picture || avatarUser
  const preferredName = user?.preferredName || 'Unassigned'
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_LEFT)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <div
        className='inline-flex w-full'
        onMouseEnter={openTooltip}
        onMouseLeave={closeTooltip}
        onClick={closeTooltip}
        ref={tipRef}
      >
        <button
          className='flex h-6 max-w-full border-0 bg-transparent p-0 text-inherit leading-inherit shadow-none outline-none hover:shadow-none focus:shadow-none [&:focus>div]:border-slate-700 [&:focus>div]:text-slate-700 [&:hover>div]:border-slate-700 [&:hover>div]:text-slate-700'
          aria-label='Assign this task to a teammate'
          onClick={canAssign ? togglePortal : undefined}
          onMouseEnter={TaskFooterUserAssigneeMenuRoot.preload}
          ref={originRef}
        >
          <div
            className={cn(
              'mr-1.5 h-6 w-6 rounded-full',
              user ? 'bg-transparent text-transparent' : 'bg-slate-600'
            )}
          >
            {user ? (
              <img className='mr-1 h-6 w-6 rounded-full' alt={preferredName} src={userImage} />
            ) : (
              <div className='relative top-px flex h-[22px] w-[22px] cursor-pointer items-center justify-center text-white [&_svg]:text-[22px]'>
                <AssignmentIndIcon />
              </div>
            )}
          </div>
          <div className='block min-w-0 max-w-full flex-1 truncate break-words text-left font-semibold text-slate-600 text-xs leading-6'>
            {preferredName}
          </div>
        </button>
      </div>
      {tooltipPortal(<div>{'Reassign Responsibility'}</div>)}
      {menuPortal(
        <TaskFooterUserAssigneeMenuRoot
          menuProps={menuProps}
          task={task}
          area={area}
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default TaskFooterUserAssignee
