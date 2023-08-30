import {EditorState} from 'draft-js'
import React from 'react'
import useTooltip from '~/hooks/useTooltip'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import CardButton from '../../../../components/CardButton'
import IconLabel from '../../../../components/IconLabel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import useTaskChildFocus, {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import lazyPreload from '../../../../utils/lazyPreload'

interface Props {
  area: AreaEnum
  editorState: EditorState
  isAgenda: boolean
  task: any
  handleCardUpdate: () => void
  useTaskChild: UseTaskChild
  mutationProps: MenuMutationProps
  dataCy: string
}

const TaskFooterTagMenu = lazyPreload(
  () =>
    import(/* webpackChunkName: 'TaskFooterTagMenu' */ '../OutcomeCardStatusMenu/TaskFooterTagMenu')
)

const TaskFooterTagMenuToggle = (props: Props) => {
  const {area, editorState, isAgenda, mutationProps, task, handleCardUpdate, useTaskChild, dataCy} =
    props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {id: taskId} = task
  const {addTaskChild, removeTaskChild} = useTaskChildFocus(taskId)
  const {
    tooltipPortal,
    openTooltip,
    closeTooltip,
    originRef: tipRef
  } = useTooltip<HTMLDivElement>(MenuPosition.UPPER_CENTER)
  return (
    <>
      <CardButton
        dataCy={`${dataCy}-button`}
        onMouseEnter={TaskFooterTagMenu.preload}
        ref={originRef}
        onClick={togglePortal}
        onBlur={() => {
          removeTaskChild('tag')
          setTimeout(handleCardUpdate)
        }}
        onFocus={() => addTaskChild('tag')}
      >
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
          editorState={editorState}
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
