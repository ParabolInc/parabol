import React from 'react'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import lazyPreload from '../../../../utils/lazyPreload'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'

const TaskFooterIntegrateMenuRoot = lazyPreload(() =>
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
      <CardButton
        onClick={togglePortal}
        ref={originRef}
        onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
        title='Integrations'
      >
        <IconLabel icon='publish' />
      </CardButton>
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
