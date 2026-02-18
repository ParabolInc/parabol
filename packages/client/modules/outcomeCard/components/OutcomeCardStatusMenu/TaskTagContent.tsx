import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskTagContent_task$key} from '~/__generated__/TaskTagContent_task.graphql'
import type {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {MenuItem} from '~/ui/Menu/MenuItem'
import MenuItemDot from '../../../../components/MenuItemDot'
import MenuItemHR from '../../../../components/MenuItemHR'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import type {MenuMutationProps} from '../../../../hooks/useMutationProps'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import DeleteTaskMutation from '../../../../mutations/DeleteTaskMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {TaskStatus} from '../../../../types/constEnums'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import TaskFooterTagMenuStatusItem from './TaskFooterTagMenuStatusItem'

const statusItems = [TaskStatus.DONE, TaskStatus.ACTIVE, TaskStatus.STUCK, TaskStatus.FUTURE]

interface Props {
  area: AreaEnum
  toggleTag: (tag: string) => void
  // TODO make area enum more fine grained to get rid of isAgenda
  isAgenda: boolean
  mutationProps: MenuMutationProps
  task: TaskTagContent_task$key
  useTaskChild: UseTaskChild
}

export const TaskTagContent = (props: Props) => {
  const {area, toggleTag, isAgenda, task: taskRef, useTaskChild} = props
  const task = useFragment(
    graphql`
      fragment TaskTagContent_task on Task {
        ...TaskFooterTagMenuStatusItem_task
        id
        status
        tags
      }
    `,
    taskRef
  )
  useTaskChild('tag')
  const atmosphere = useAtmosphere()
  const {id: taskId, status: taskStatus, tags} = task
  const isPrivate = isTaskPrivate(tags)
  return (
    <>
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
      <MenuItem key='private' onSelect={() => toggleTag('private')}>
        <MenuItemDot color={PALETTE.GOLD_300} />
        <span>
          {isPrivate ? 'Remove ' : 'Set as '}
          <b>{'#private'}</b>
        </span>
      </MenuItem>
      {isAgenda ? (
        <MenuItem key='delete' onSelect={() => DeleteTaskMutation(atmosphere, {taskId})}>
          <MenuItemDot color={PALETTE.TOMATO_500} />
          {'Delete this Task'}
        </MenuItem>
      ) : (
        <MenuItem key='archive' onSelect={() => toggleTag('archived')}>
          <MenuItemDot color={PALETTE.SLATE_500} />
          <span>
            {'Set as '}
            <b>{'#archived'}</b>
          </span>
        </MenuItem>
      )}
    </>
  )
}
