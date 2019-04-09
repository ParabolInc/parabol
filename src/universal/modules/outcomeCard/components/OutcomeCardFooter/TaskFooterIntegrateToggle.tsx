import React from 'react'
import CardButton from 'universal/components/CardButton'
import IconLabel from 'universal/components/IconLabel'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import lazyPreload from 'universal/utils/lazyPreload'

const TaskFooterIntegrateMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterIntegrateMenu' */ 'universal/components/TaskFooterIntegrateMenu')
)

interface Props {
  task: any
  toggleMenuState: () => void
}

const TaskFooterIntegrateToggle = (props: Props) => {
  const {task, toggleMenuState} = props
  const {togglePortal, originRef, menuPortal, closePortal} = useMenu(MenuPosition.UPPER_RIGHT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })
  return (
    <>
      <CardButton
        onClick={togglePortal}
        innerRef={originRef}
        onMouseEnter={TaskFooterIntegrateMenu.preload}
      >
        <IconLabel icon='publish' />
      </CardButton>
      {menuPortal(<TaskFooterIntegrateMenu closePortal={closePortal} task={task} />)}
    </>
  )
}

export default TaskFooterIntegrateToggle
