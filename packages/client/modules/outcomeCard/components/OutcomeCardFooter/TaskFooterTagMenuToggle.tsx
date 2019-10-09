import {EditorState} from 'draft-js'
import React from 'react'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import lazyPreload from '../../../../utils/lazyPreload'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {AreaEnum} from '../../../../types/graphql'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'

interface Props {
  area: AreaEnum
  editorState: EditorState
  isAgenda: boolean
  task: any
  useTaskChild: UseTaskChild
  mutationProps: MenuMutationProps
}

const TaskFooterTagMenu = lazyPreload(() =>
  import(/* webpackChunkName: 'TaskFooterTagMenu' */ '../OutcomeCardStatusMenu/TaskFooterTagMenu')
)

const TaskFooterTagMenuToggle = (props: Props) => {
  const {area, editorState, isAgenda, mutationProps, task, useTaskChild} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  return (
    <>
      <CardButton onMouseEnter={TaskFooterTagMenu.preload} ref={originRef} onClick={togglePortal}>
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
          useTaskChild={useTaskChild}
        />
      )}
    </>
  )
}

export default TaskFooterTagMenuToggle
