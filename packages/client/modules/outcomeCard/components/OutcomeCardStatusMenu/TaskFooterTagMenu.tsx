import graphql from 'babel-plugin-relay/macro'
import {EditorState} from 'draft-js'
import React from 'react'
import {useFragment} from 'react-relay'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import Menu from '../../../../components/Menu'
import MenuItem from '../../../../components/MenuItem'
import MenuItemDot from '../../../../components/MenuItemDot'
import MenuItemHR from '../../../../components/MenuItemHR'
import MenuItemLabel from '../../../../components/MenuItemLabel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuProps} from '../../../../hooks/useMenu'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import DeleteTaskMutation from '../../../../mutations/DeleteTaskMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {TaskStatus} from '../../../../types/constEnums'
import addContentTag from '../../../../utils/draftjs/addContentTag'
import removeContentTag from '../../../../utils/draftjs/removeContentTag'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import {TaskFooterTagMenu_task$key} from '../../../../__generated__/TaskFooterTagMenu_task.graphql'
import TaskFooterTagMenuStatusItem from './TaskFooterTagMenuStatusItem'

const statusItems = [TaskStatus.DONE, TaskStatus.ACTIVE, TaskStatus.STUCK, TaskStatus.FUTURE]

interface Props {
  area: AreaEnum
  menuProps: MenuProps
  editorState: EditorState
  // TODO make area enum more fine grained to get rid of isAgenda
  isAgenda: boolean
  mutationProps: MenuMutationProps
  task: TaskFooterTagMenu_task$key
  useTaskChild: UseTaskChild
}

const TaskFooterTagMenu = (props: Props) => {
  const {area, menuProps, editorState, isAgenda, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskFooterTagMenu_task on Task {
        ...TaskFooterTagMenuStatusItem_task
        id
        content
        status
        tags
      }
    `,
    taskRef
  )
  useTaskChild('tag')
  const atmosphere = useAtmosphere()
  const {id: taskId, status: taskStatus, tags, content} = task
  const isPrivate = isTaskPrivate(tags)
  const handlePrivate = () => {
    isPrivate
      ? removeContentTag('private', atmosphere, taskId, content, area)
      : addContentTag('#private', atmosphere, taskId, editorState.getCurrentContent(), area)
  }
  return (
    <Menu ariaLabel={'Change the status of the task'} {...menuProps}>
      {statusItems
        .filter((status) => status !== taskStatus)
        .map((status) => (
          <TaskFooterTagMenuStatusItem
            key={status}
            area={area}
            status={status as any}
            task={task}
          />
        ))}
      <MenuItemHR key='HR1' />
      <MenuItem
        key='private'
        label={
          <MenuItemLabel>
            <MenuItemDot color={PALETTE.GOLD_300} />
            <span>
              {isPrivate ? 'Remove ' : 'Set as '}
              <b>{'#private'}</b>
            </span>
          </MenuItemLabel>
        }
        onClick={handlePrivate}
      />
      {isAgenda ? (
        <MenuItem
          key='delete'
          label={
            <MenuItemLabel>
              <MenuItemDot color={PALETTE.TOMATO_500} />
              {'Delete this Task'}
            </MenuItemLabel>
          }
          onClick={() => DeleteTaskMutation(atmosphere, {taskId})}
        />
      ) : (
        <MenuItem
          key='archive'
          label={
            <MenuItemLabel>
              <MenuItemDot color={PALETTE.SLATE_500} />
              <span>
                {'Set as '}
                <b>{'#archived'}</b>
              </span>
            </MenuItemLabel>
          }
          onClick={() =>
            addContentTag('#archived', atmosphere, taskId, editorState.getCurrentContent(), area)
          }
        />
      )}
    </Menu>
  )
}

export default TaskFooterTagMenu
