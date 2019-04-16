import React from 'react'
import CardButton from 'universal/components/CardButton'
import IconLabel from 'universal/components/IconLabel'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import lazyPreload from 'universal/utils/lazyPreload'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

const TaskFooterIntegrateMenuRoot = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterIntegrateMenuRoot' */ 'universal/components/TaskFooterIntegrateMenuRoot')
)

interface Props {
  mutationProps: MenuMutationProps
  task: any
  toggleMenuState: () => void
}

const TaskFooterIntegrateToggle = (props: Props) => {
  const {mutationProps, task, toggleMenuState} = props
  const {togglePortal, originRef, menuPortal, closePortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })
  return (
    <>
      <CardButton
        onClick={togglePortal}
        innerRef={originRef}
        onMouseEnter={TaskFooterIntegrateMenuRoot.preload}
      >
        <IconLabel icon='publish' />
      </CardButton>
      {menuPortal(
        <TaskFooterIntegrateMenuRoot
          closePortal={closePortal}
          mutationProps={mutationProps}
          task={task}
        />
      )}
    </>
  )
}

export default TaskFooterIntegrateToggle
