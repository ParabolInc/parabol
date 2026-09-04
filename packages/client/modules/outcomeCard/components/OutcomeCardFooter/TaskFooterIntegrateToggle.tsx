import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
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
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth, loadingDelay} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200
    }
  )
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <CardButton
            onClick={togglePortal}
            ref={originRef}
            onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
          >
            <IconLabel icon='widgets' />
          </CardButton>
        </TooltipTrigger>
        <TooltipContent side='bottom'>Push to Integration</TooltipContent>
      </Tooltip>
      {menuPortal(
        <TaskFooterIntegrateMenuRoot
          menuProps={menuProps}
          loadingDelay={loadingDelay}
          loadingWidth={loadingWidth}
          mutationProps={mutationProps}
          task={task}
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default TaskFooterIntegrateToggle
