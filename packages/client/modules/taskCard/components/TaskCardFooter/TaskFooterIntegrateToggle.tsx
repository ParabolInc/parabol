import {Suspense} from 'react'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import lazyPreload from '../../../../utils/lazyPreload'

const TaskFooterIntegrateMenuRoot = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ '../../../../components/TaskFooterIntegrateMenuRoot'
    )
)

interface Props {
  mutationProps: MenuMutationProps
  task: any
  useTaskChild: UseTaskChild
}

const TaskFooterIntegrateToggle = (props: Props) => {
  const {mutationProps, task, useTaskChild} = props
  return (
    <Tooltip>
      <Menu
        trigger={
          <TooltipTrigger asChild>
            <CardButton onMouseEnter={TaskFooterIntegrateMenuRoot.preload}>
              <IconLabel icon='widgets' />
            </CardButton>
          </TooltipTrigger>
        }
      >
        <MenuContent align='end' className='w-[250px]'>
          <Suspense fallback={null}>
            <TaskFooterIntegrateMenuRoot
              mutationProps={mutationProps}
              task={task}
              useTaskChild={useTaskChild}
            />
          </Suspense>
        </MenuContent>
      </Menu>
      <TooltipContent side='bottom'>Push to Integration</TooltipContent>
    </Tooltip>
  )
}

export default TaskFooterIntegrateToggle
