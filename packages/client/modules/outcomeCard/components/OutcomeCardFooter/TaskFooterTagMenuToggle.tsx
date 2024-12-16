import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import useTooltip from '~/hooks/useTooltip'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  area: AreaEnum
  toggleTag: (tag: string) => void
  isAgenda: boolean
  task: any
  useTaskChild: UseTaskChild
  mutationProps: MenuMutationProps
}

const TaskFooterTagMenu = lazyPreload(
  () =>
    import(/* webpackChunkName: 'TaskFooterTagMenu' */ '../OutcomeCardStatusMenu/TaskFooterTagMenu')
)

const TaskFooterTagMenuToggle = (props: Props) => {
  const {area, toggleTag, isAgenda, mutationProps, task, useTaskChild} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <CardButton onMouseEnter={TaskFooterTagMenu.preload} ref={originRef} onClick={togglePortal}>
        <IconLabel
          icon='more_vert'
          onMouseEnter={openTooltip}
          onMouseLeave={closeTooltip}
          onClick={closeTooltip}
          ref={tipRef}
        />
      </CardButton>
      {menuPortal(
        <TaskFooterTagMenu
          area={area}
          toggleTag={toggleTag}
          isAgenda={isAgenda}
          menuProps={menuProps}
          task={task}
          mutationProps={mutationProps}
          useTaskChild={useTaskChild}
        />
      )}
      {tooltipPortal(<div>{'Set Status'}</div>)}
    </>
  )
}

export default TaskFooterTagMenuToggle
