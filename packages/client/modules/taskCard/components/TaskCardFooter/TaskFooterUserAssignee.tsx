import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {cn} from '~/ui/cn'
import {AssignmentInd as AssignmentIndIcon} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import type {TaskFooterUserAssignee_task$key} from '../../../../__generated__/TaskFooterUserAssignee_task.graphql'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import avatarUser from '../../../../styles/theme/images/avatar-user.svg'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
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
  const trigger = (
    <button
      className='flex h-6 max-w-full border-0 bg-transparent p-0 text-inherit leading-inherit shadow-none outline-none hover:shadow-none focus:shadow-none [&:focus>div]:border-fg-primary [&:focus>div]:text-fg-primary [&:hover>div]:border-fg-primary [&:hover>div]:text-fg-primary'
      aria-label='Assign this task to a teammate'
      onMouseEnter={TaskFooterUserAssigneeMenuRoot.preload}
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
      <div className='block min-w-0 max-w-full flex-1 truncate break-words text-left font-semibold text-fg-secondary text-xs leading-6'>
        {preferredName}
      </div>
    </button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className='inline-flex w-full'>
          {canAssign ? (
            <Menu trigger={trigger}>
              <MenuContent align='start'>
                <Suspense fallback={null}>
                  <TaskFooterUserAssigneeMenuRoot
                    task={task}
                    area={area}
                    useTaskChild={useTaskChild}
                  />
                </Suspense>
              </MenuContent>
            </Menu>
          ) : (
            trigger
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side='bottom'>Reassign Responsibility</TooltipContent>
    </Tooltip>
  )
}

export default TaskFooterUserAssignee
