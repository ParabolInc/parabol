import useTooltip from '~/hooks/useTooltip'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
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
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <CardButton
        onClick={togglePortal}
        ref={originRef}
        onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
      >
        <IconLabel
          icon='widgets'
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={closeTooltip}
          ref={tipRef}
        />
      </CardButton>
      {tooltipPortal(<div>{'Push to Integration'}</div>)}
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
