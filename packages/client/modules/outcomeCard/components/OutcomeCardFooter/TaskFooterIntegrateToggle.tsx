import React from 'react'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import lazyPreload from '../../../../utils/lazyPreload'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'

const TaskFooterIntegrateMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ '../../../../components/TaskFooterIntegrateMenuRoot')
)

interface Props {
  mutationProps: MenuMutationProps
  task: any
  toggleMenuState: () => void
}

const TaskFooterIntegrateToggle = (props: Props) => {
  const {mutationProps, task, toggleMenuState} = props
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth, loadingDelay} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200,
      onOpen: toggleMenuState,
      onClose: toggleMenuState
    }
  )
  return (
    <>
      <CardButton
        onClick={togglePortal}
        ref={originRef}
        onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
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
        />
      )}
    </>
  )
}

export default TaskFooterIntegrateToggle
