import {EditorState} from 'draft-js'
import React from 'react'
import CardButton from 'universal/components/CardButton'
import IconLabel from 'universal/components/IconLabel'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import lazyPreload from 'universal/utils/lazyPreload'
import {MenuMutationProps} from 'universal/hooks/useMutationProps'

interface Props {
  area: string
  editorState: EditorState
  isAgenda: boolean
  task: any
  toggleMenuState: () => void
  mutationProps: MenuMutationProps
}

const TaskFooterTagMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterTagMenu' */ 'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/TaskFooterTagMenu')
)

const TaskFooterTagMenuToggle = (props: Props) => {
  const {area, editorState, isAgenda, mutationProps, task, toggleMenuState} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT, {
    onOpen: toggleMenuState,
    onClose: toggleMenuState
  })

  return (
    <>
      <CardButton
        onMouseEnter={TaskFooterTagMenu.preload}
        innerRef={originRef}
        onClick={togglePortal}
      >
        <IconLabel icon='more_vert' />
      </CardButton>
      {menuPortal(
        <TaskFooterTagMenu
          area={area}
          editorState={editorState}
          isAgenda={isAgenda}
          menuProps={menuProps}
          task={task}
          mutationProps={mutationProps}
        />
      )}
    </>
  )
}

export default TaskFooterTagMenuToggle
